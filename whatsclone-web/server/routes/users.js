const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validateUpdateProfile } = require('../middleware/validation');
const {
  getProfile,
  updateProfile,
  searchUsers,
  updateOnlineStatus,
  uploadAvatar
} = require('../controllers/userController');

// @route   GET /api/users/profile
// @desc    Obter perfil do usuário logado
// @access  Private
router.get('/profile', auth, getProfile);

// @route   PUT /api/users/profile
// @desc    Atualizar perfil do usuário
// @access  Private
router.put('/profile', auth, validateUpdateProfile, updateProfile);

// @route   GET /api/users/search
// @desc    Buscar usuários por telefone ou nome
// @access  Private
router.get('/search', auth, searchUsers);

// @route   PUT /api/users/online-status
// @desc    Atualizar status online/offline
// @access  Private
router.put('/online-status', auth, updateOnlineStatus);

// @route   POST /api/users/avatar
// @desc    Upload de avatar
// @access  Private
router.post('/avatar', auth, uploadAvatar);

module.exports = router;
