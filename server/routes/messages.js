const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validateMessage } = require('../middleware/validation');
const {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markAsRead,
  markAsDelivered,
  uploadFile
} = require('../controllers/messageController');

// @route   GET /api/messages/:chatId
// @desc    Obter mensagens de um chat
// @access  Private
router.get('/:chatId', auth, getMessages);

// @route   POST /api/messages
// @desc    Enviar nova mensagem
// @access  Private
router.post('/', auth, validateMessage, sendMessage);

// @route   PUT /api/messages/:id
// @desc    Editar mensagem
// @access  Private
router.put('/:id', auth, validateMessage, editMessage);

// @route   DELETE /api/messages/:id
// @desc    Deletar mensagem
// @access  Private
router.delete('/:id', auth, deleteMessage);

// @route   PUT /api/messages/:id/read
// @desc    Marcar mensagem como lida
// @access  Private
router.put('/:id/read', auth, markAsRead);

// @route   PUT /api/messages/:id/delivered
// @desc    Marcar mensagem como entregue
// @access  Private
router.put('/:id/delivered', auth, markAsDelivered);

// @route   POST /api/messages/upload
// @desc    Upload de arquivo para mensagem
// @access  Private
router.post('/upload', auth, uploadFile);

module.exports = router;
