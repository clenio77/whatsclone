const User = require('../models/User');

// @desc    Obter perfil do usuário logado
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }
    });
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Atualizar perfil do usuário
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, status } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (status !== undefined) updateData.status = status;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Buscar usuários por telefone ou nome
// @route   GET /api/users/search
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Query deve ter pelo menos 2 caracteres'
      });
    }
    
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Excluir o próprio usuário
        { isVerified: true }, // Apenas usuários verificados
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { phone: { $regex: q } }
          ]
        }
      ]
    })
    .select('name phone avatar status isOnline lastSeen')
    .limit(20);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Erro na busca:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Atualizar status online/offline
// @route   PUT /api/users/online-status
// @access  Private
const updateOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        isOnline: Boolean(isOnline),
        lastSeen: new Date()
      },
      { new: true }
    );
    
    res.json({
      success: true,
      data: {
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Upload de avatar (placeholder)
// @route   POST /api/users/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    // TODO: Implementar upload de arquivo
    res.json({
      success: true,
      message: 'Upload de avatar será implementado em breve'
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  searchUsers,
  updateOnlineStatus,
  uploadAvatar
};
