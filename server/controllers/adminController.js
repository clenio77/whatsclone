const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const AIBot = require('../models/AIBot');
const securityLogger = require('../services/securityLogger');
const tokenBlacklist = require('../services/tokenBlacklist');

// @desc    Dashboard - Estatísticas gerais
// @route   GET /api/admin/dashboard
// @access  Admin
const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalChats,
      totalMessages,
      totalBots,
      recentUsers,
      securityStats
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isOnline: true }),
      Chat.countDocuments(),
      Message.countDocuments(),
      AIBot.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(10).select('name email phone createdAt isVerified isOnline'),
      securityLogger.getSecurityStats(24)
    ]);

    // Estatísticas de crescimento (últimos 30 dias)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [newUsers, newChats, newMessages] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Chat.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Message.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    // Estatísticas de sessões
    const sessionStats = tokenBlacklist.getSecurityStats();

    const dashboard = {
      overview: {
        totalUsers,
        activeUsers,
        totalChats,
        totalMessages,
        totalBots
      },
      growth: {
        newUsers,
        newChats,
        newMessages,
        period: '30 dias'
      },
      recentUsers,
      security: securityStats,
      sessions: sessionStats
    };

    securityLogger.logSecurityEvent('ADMIN_DASHBOARD_ACCESS', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      adminId: req.user._id
    });

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Erro ao obter dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Listar usuários com filtros e paginação
// @route   GET /api/admin/users
// @access  Admin
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      role,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Construir filtros
    const filters = {};
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      switch (status) {
        case 'verified':
          filters.isVerified = true;
          break;
        case 'unverified':
          filters.isVerified = false;
          break;
        case 'online':
          filters.isOnline = true;
          break;
        case 'locked':
          filters.isLocked = true;
          break;
      }
    }

    if (role) {
      filters.role = role;
    }

    // Configurar ordenação
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Executar consulta com paginação
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [users, totalUsers] = await Promise.all([
      User.find(filters)
        .select('-password -verificationToken -tokenExpires')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter detalhes de um usuário
// @route   GET /api/admin/users/:id
// @access  Admin
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password -verificationToken -tokenExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Obter estatísticas do usuário
    const [chatCount, messageCount, activeSessions, securityEvents] = await Promise.all([
      Chat.countDocuments({ participants: id }),
      Message.countDocuments({ sender: id }),
      tokenBlacklist.getActiveSessions(id),
      securityLogger.searchEvents({
        userId: id,
        limit: 50,
        since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
      })
    ]);

    const userDetails = {
      user,
      stats: {
        chatCount,
        messageCount,
        activeSessionsCount: activeSessions.length,
        securityEventsCount: securityEvents.length
      },
      activeSessions,
      recentSecurityEvents: securityEvents.slice(0, 10)
    };

    res.json({
      success: true,
      data: userDetails
    });
  } catch (error) {
    console.error('Erro ao obter detalhes do usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Atualizar usuário
// @route   PUT /api/admin/users/:id
// @access  Admin
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isVerified, isLocked, lockReason } = req.body;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Não permitir que admin altere seu próprio role
    if (id === req.user._id.toString() && role && role !== user.role) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível alterar seu próprio role'
      });
    }

    // Atualizar campos
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isVerified === 'boolean') user.isVerified = isVerified;
    if (typeof isLocked === 'boolean') {
      user.isLocked = isLocked;
      if (isLocked && lockReason) {
        user.lockReason = lockReason;
        user.lockUntil = null; // Lock permanente até admin desbloquear
      } else if (!isLocked) {
        user.lockReason = null;
        user.lockUntil = null;
        user.loginAttempts = 0;
      }
    }

    await user.save();

    // Se usuário foi bloqueado, revogar todas as sessões
    if (isLocked) {
      await tokenBlacklist.revokeAllUserSessions(id);
    }

    securityLogger.logSecurityEvent('USER_UPDATED_BY_ADMIN', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      adminId: req.user._id,
      targetUserId: id,
      changes: { name, email, role, isVerified, isLocked, lockReason }
    });

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: user
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Deletar usuário
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Não permitir que admin delete a si mesmo
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível deletar sua própria conta'
      });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Revogar todas as sessões do usuário
    await tokenBlacklist.revokeAllUserSessions(id);

    // Deletar usuário (as mensagens e chats podem ser mantidos para histórico)
    await User.findByIdAndDelete(id);

    securityLogger.logSecurityEvent('USER_DELETED_BY_ADMIN', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      adminId: req.user._id,
      deletedUserId: id,
      deletedUserEmail: user.email
    });

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Revogar sessões de um usuário
// @route   POST /api/admin/users/:id/revoke-sessions
// @access  Admin
const revokeUserSessions = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const revokedCount = await tokenBlacklist.revokeAllUserSessions(id);

    securityLogger.logSecurityEvent('USER_SESSIONS_REVOKED_BY_ADMIN', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      adminId: req.user._id,
      targetUserId: id,
      revokedCount
    });

    res.json({
      success: true,
      message: `${revokedCount} sessões revogadas com sucesso`
    });
  } catch (error) {
    console.error('Erro ao revogar sessões:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  revokeUserSessions
};
