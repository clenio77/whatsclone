const axios = require('axios');
const AIBot = require('../models/AIBot');
const { aiService } = require('../services/aiService');

// @desc    Conversar com IA
// @route   POST /api/ai/chat
// @access  Private
const chatWithAI = async (req, res) => {
  try {
    const { messages, provider = 'groq', model, temperature = 0.7, maxTokens = 1000 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: 'Mensagens são obrigatórias'
      });
    }

    // Usar serviço de IA
    const response = await aiService.chat(messages, {
      provider,
      model,
      temperature,
      maxTokens
    });

    res.json({
      success: true,
      data: {
        content: response.content,
        provider: response.provider,
        model: response.model,
        usage: response.usage
      }
    });

  } catch (error) {
    console.error('Erro na conversa com IA:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao comunicar com IA'
    });
  }
};

// @desc    Obter configuração da IA
// @route   GET /api/ai/config
// @access  Private
const getAIConfig = async (req, res) => {
  try {
    const config = {
      providers: {
        openai: {
          name: 'OpenAI',
          models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
          configured: !!process.env.OPENAI_API_KEY
        },
        anthropic: {
          name: 'Anthropic',
          models: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'],
          configured: !!process.env.ANTHROPIC_API_KEY
        },
        groq: {
          name: 'Groq',
          models: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768'],
          configured: !!process.env.GROQ_API_KEY
        },
        ollama: {
          name: 'Ollama (Local)',
          models: ['llama3', 'mistral', 'codellama'],
          configured: true // Sempre disponível se Ollama estiver rodando
        }
      },
      defaultProvider: process.env.DEFAULT_AI_PROVIDER || 'groq',
      defaultModel: process.env.DEFAULT_AI_MODEL || 'llama3-8b-8192'
    };

    res.json({
      success: true,
      data: config
    });

  } catch (error) {
    console.error('Erro ao obter configuração IA:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Atualizar configuração da IA
// @route   PUT /api/ai/config
// @access  Private
const updateAIConfig = async (req, res) => {
  try {
    // Por enquanto, apenas retorna sucesso
    // Em uma implementação real, salvaria as preferências do usuário
    res.json({
      success: true,
      message: 'Configuração atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar configuração IA:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Listar provedores de IA disponíveis
// @route   GET /api/ai/providers
// @access  Private
const getAIProviders = async (req, res) => {
  try {
    const providers = [
      {
        id: 'openai',
        name: 'OpenAI',
        description: 'GPT-3.5 e GPT-4',
        models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
        configured: !!process.env.OPENAI_API_KEY,
        pricing: 'Pago'
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        description: 'Claude 3 (Haiku, Sonnet, Opus)',
        models: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'],
        configured: !!process.env.ANTHROPIC_API_KEY,
        pricing: 'Pago'
      },
      {
        id: 'groq',
        name: 'Groq',
        description: 'LLaMA 3 e Mixtral (Rápido)',
        models: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768'],
        configured: !!process.env.GROQ_API_KEY,
        pricing: 'Gratuito'
      },
      {
        id: 'ollama',
        name: 'Ollama',
        description: 'Modelos locais',
        models: ['llama3', 'mistral', 'codellama'],
        configured: true,
        pricing: 'Gratuito (Local)'
      }
    ];

    res.json({
      success: true,
      data: providers
    });

  } catch (error) {
    console.error('Erro ao listar provedores:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Criar bot IA personalizado
// @route   POST /api/ai/bots
// @access  Private
const createAIBot = async (req, res) => {
  try {
    const { name, description, systemPrompt, provider = 'groq', model, isPublic = false } = req.body;

    const bot = new AIBot({
      name,
      description,
      systemPrompt,
      provider,
      model,
      isPublic,
      creator: req.user._id
    });

    await bot.save();

    res.status(201).json({
      success: true,
      message: 'Bot IA criado com sucesso',
      data: bot
    });

  } catch (error) {
    console.error('Erro ao criar bot IA:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Listar bots IA do usuário
// @route   GET /api/ai/bots
// @access  Private
const getAIBots = async (req, res) => {
  try {
    const bots = await AIBot.find({
      $or: [
        { creator: req.user._id },
        { isPublic: true }
      ]
    }).populate('creator', 'name');

    res.json({
      success: true,
      data: bots
    });

  } catch (error) {
    console.error('Erro ao listar bots IA:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Deletar bot IA
// @route   DELETE /api/ai/bots/:id
// @access  Private
const deleteAIBot = async (req, res) => {
  try {
    const bot = await AIBot.findById(req.params.id);

    if (!bot) {
      return res.status(404).json({
        success: false,
        error: 'Bot não encontrado'
      });
    }

    // Verificar se o usuário é o criador
    if (!bot.creator.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }

    await bot.deleteOne();

    res.json({
      success: true,
      message: 'Bot deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar bot IA:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  chatWithAI,
  getAIConfig,
  updateAIConfig,
  getAIProviders,
  createAIBot,
  getAIBots,
  deleteAIBot
};
