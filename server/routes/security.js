const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const securityLogger = require('../services/securityLogger');
const tokenBlacklist = require('../services/tokenBlacklist');
const User = require('../models/User');

// @route   GET /api/security/sessions
// @desc    Obter sessões ativas do usuário
// @access  Private
router.get('/sessions', auth, async (req, res) => {
  try {
    const sessions = tokenBlacklist.getActiveSessions(req.user._id.toString());
    
    // Marcar sessão atual
    const currentSessionId = req.sessionId;
    const sessionsWithCurrent = sessions.map(session => ({
      ...session,
      isCurrent: session.id === currentSessionId
    }));

    res.json({
      success: true,
      data: sessionsWithCurrent
    });
  } catch (error) {
    console.error('Erro ao obter sessões:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   DELETE /api/security/sessions/:sessionId
// @desc    Revogar sessão específica
// @access  Private
router.delete('/sessions/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id.toString();
    
    const sessions = tokenBlacklist.getActiveSessions(userId);
    const session = sessions.find(s => s.id === sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Sessão não encontrada'
      });
    }

    // Não permitir revogar sessão atual
    if (sessionId === req.sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível revogar a sessão atual'
      });
    }

    // Encontrar token da sessão e adicionar à blacklist
    const userSessions = tokenBlacklist.sessionStore.get(userId);
    if (userSessions && userSessions.has(sessionId)) {
      const sessionData = userSessions.get(sessionId);
      await tokenBlacklist.addToBlacklist(sessionData.token, 'user_revoked');
    }

    securityLogger.logSecurityEvent('SESSION_REVOKED', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user._id,
      revokedSessionId: sessionId
    });

    res.json({
      success: true,
      message: 'Sessão revogada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao revogar sessão:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   DELETE /api/security/sessions
// @desc    Revogar todas as outras sessões
// @access  Private
router.delete('/sessions', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const currentToken = req.token;
    
    const revokedCount = await tokenBlacklist.revokeAllUserSessions(userId, currentToken);

    securityLogger.logSecurityEvent('ALL_SESSIONS_REVOKED', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user._id,
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
});

// @route   GET /api/security/events
// @desc    Obter eventos de segurança do usuário
// @access  Private
router.get('/events', auth, async (req, res) => {
  try {
    const { limit = 50, type, severity } = req.query;
    
    const events = await securityLogger.searchEvents({
      ip: req.ip, // Filtrar por IP do usuário
      limit: parseInt(limit),
      type,
      severity,
      since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
    });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Erro ao obter eventos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   POST /api/security/change-password
// @desc    Alterar senha com validações de segurança
// @access  Private
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Senha atual e nova senha são obrigatórias'
      });
    }

    // Validar senha atual
    const user = await User.findById(req.user._id);
    const isValidPassword = await user.comparePassword(currentPassword);
    
    if (!isValidPassword) {
      securityLogger.logSecurityEvent('PASSWORD_CHANGE_FAILED', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user._id,
        reason: 'invalid_current_password'
      });

      return res.status(400).json({
        success: false,
        error: 'Senha atual incorreta'
      });
    }

    // Validar nova senha
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Nova senha deve ter pelo menos 8 caracteres'
      });
    }

    // Verificar se nova senha é diferente da atual
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        error: 'Nova senha deve ser diferente da atual'
      });
    }

    // Atualizar senha
    user.password = newPassword;
    await user.save();

    // Revogar todas as outras sessões por segurança
    const currentToken = req.token;
    await tokenBlacklist.revokeAllUserSessions(req.user._id.toString(), currentToken);

    securityLogger.logSecurityEvent('PASSWORD_CHANGED', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user._id
    });

    res.json({
      success: true,
      message: 'Senha alterada com sucesso. Outras sessões foram encerradas.'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/security/stats
// @desc    Estatísticas de segurança (Admin)
// @access  Admin
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    
    const [securityStats, sessionStats] = await Promise.all([
      securityLogger.getSecurityStats(parseInt(hours)),
      tokenBlacklist.getSecurityStats()
    ]);

    res.json({
      success: true,
      data: {
        security: securityStats,
        sessions: sessionStats,
        period: `${hours} horas`
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// @route   GET /api/security/alerts
// @desc    Alertas de segurança (Admin)
// @access  Admin
router.get('/alerts', auth, adminAuth, async (req, res) => {
  try {
    const { limit = 100, severity } = req.query;
    
    const alerts = await securityLogger.searchEvents({
      type: 'SECURITY_ALERT',
      severity,
      limit: parseInt(limit),
      since: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
    });

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Erro ao obter alertas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
