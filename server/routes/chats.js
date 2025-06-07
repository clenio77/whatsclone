const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validateCreateChat } = require('../middleware/validation');
const {
  getChats,
  createChat,
  getChatById,
  updateChat,
  deleteChat,
  addParticipant,
  removeParticipant,
  markAsRead
} = require('../controllers/chatController');

// @route   GET /api/chats
// @desc    Obter todos os chats do usuário
// @access  Private
router.get('/', auth, getChats);

// @route   POST /api/chats
// @desc    Criar novo chat
// @access  Private
router.post('/', auth, validateCreateChat, createChat);

// @route   GET /api/chats/:id
// @desc    Obter chat específico
// @access  Private
router.get('/:id', auth, getChatById);

// @route   PUT /api/chats/:id
// @desc    Atualizar chat (nome do grupo, etc.)
// @access  Private
router.put('/:id', auth, updateChat);

// @route   DELETE /api/chats/:id
// @desc    Deletar chat
// @access  Private
router.delete('/:id', auth, deleteChat);

// @route   POST /api/chats/:id/participants
// @desc    Adicionar participante ao chat
// @access  Private
router.post('/:id/participants', auth, addParticipant);

// @route   DELETE /api/chats/:id/participants/:userId
// @desc    Remover participante do chat
// @access  Private
router.delete('/:id/participants/:userId', auth, removeParticipant);

// @route   PUT /api/chats/:id/read
// @desc    Marcar chat como lido
// @access  Private
router.put('/:id/read', auth, markAsRead);

module.exports = router;
