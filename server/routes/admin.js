const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
  getDashboard,
  getUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  revokeUserSessions
} = require('../controllers/adminController');

// Aplicar middleware de autenticação e admin para todas as rotas
router.use(auth);
router.use(adminAuth);

// @route   GET /api/admin/dashboard
// @desc    Dashboard com estatísticas gerais
// @access  Admin
router.get('/dashboard', getDashboard);

// @route   GET /api/admin/users
// @desc    Listar usuários com filtros e paginação
// @access  Admin
router.get('/users', getUsers);

// @route   GET /api/admin/users/:id
// @desc    Obter detalhes de um usuário específico
// @access  Admin
router.get('/users/:id', getUserDetails);

// @route   PUT /api/admin/users/:id
// @desc    Atualizar dados de um usuário
// @access  Admin
router.put('/users/:id', updateUser);

// @route   DELETE /api/admin/users/:id
// @desc    Deletar um usuário
// @access  Admin
router.delete('/users/:id', deleteUser);

// @route   POST /api/admin/users/:id/revoke-sessions
// @desc    Revogar todas as sessões de um usuário
// @access  Admin
router.post('/users/:id/revoke-sessions', revokeUserSessions);

module.exports = router;
