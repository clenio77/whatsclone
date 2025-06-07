const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  chatWithAI,
  getAIConfig,
  updateAIConfig,
  getAIProviders,
  createAIBot,
  getAIBots,
  deleteAIBot
} = require('../controllers/aiController');

// @route   POST /api/ai/chat
// @desc    Conversar com IA
// @access  Private
router.post('/chat', auth, chatWithAI);

// @route   GET /api/ai/config
// @desc    Obter configuração da IA
// @access  Private
router.get('/config', auth, getAIConfig);

// @route   PUT /api/ai/config
// @desc    Atualizar configuração da IA
// @access  Private
router.put('/config', auth, updateAIConfig);

// @route   GET /api/ai/providers
// @desc    Listar provedores de IA disponíveis
// @access  Private
router.get('/providers', auth, getAIProviders);

// @route   POST /api/ai/bots
// @desc    Criar bot IA personalizado
// @access  Private
router.post('/bots', auth, createAIBot);

// @route   GET /api/ai/bots
// @desc    Listar bots IA do usuário
// @access  Private
router.get('/bots', auth, getAIBots);

// @route   DELETE /api/ai/bots/:id
// @desc    Deletar bot IA
// @access  Private
router.delete('/bots/:id', auth, deleteAIBot);

module.exports = router;
