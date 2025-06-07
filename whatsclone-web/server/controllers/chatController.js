const Chat = require('../models/Chat');
const Message = require('../models/Message');

// @desc    Obter todos os chats do usuário
// @route   GET /api/chats
// @access  Private
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
    .populate('participants', 'name avatar isOnline lastSeen')
    .populate('lastMessage')
    .populate('groupAdmin', 'name')
    .sort({ lastActivity: -1 });

    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Erro ao obter chats:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Criar novo chat
// @route   POST /api/chats
// @access  Private
const createChat = async (req, res) => {
  try {
    const { participants, isGroup = false, groupName } = req.body;
    
    // Adicionar o usuário atual aos participantes
    const allParticipants = [...new Set([req.user._id.toString(), ...participants])];
    
    // Para chats individuais, verificar se já existe
    if (!isGroup && allParticipants.length === 2) {
      const existingChat = await Chat.findOne({
        isGroup: false,
        participants: { $all: allParticipants, $size: 2 }
      });
      
      if (existingChat) {
        return res.json({
          success: true,
          message: 'Chat já existe',
          data: existingChat
        });
      }
    }
    
    const chatData = {
      participants: allParticipants,
      isGroup,
      lastActivity: new Date()
    };
    
    if (isGroup) {
      chatData.groupName = groupName;
      chatData.groupAdmin = req.user._id;
    }
    
    const chat = new Chat(chatData);
    await chat.save();
    
    await chat.populate('participants', 'name avatar isOnline lastSeen');
    
    res.status(201).json({
      success: true,
      message: 'Chat criado com sucesso',
      data: chat
    });
  } catch (error) {
    console.error('Erro ao criar chat:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter chat específico
// @route   GET /api/chats/:id
// @access  Private
const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name avatar isOnline lastSeen')
      .populate('lastMessage')
      .populate('groupAdmin', 'name');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat não encontrado'
      });
    }
    
    // Verificar se o usuário faz parte do chat
    if (!chat.participants.some(p => p._id.equals(req.user._id))) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }
    
    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Erro ao obter chat:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Atualizar chat (placeholder)
// @route   PUT /api/chats/:id
// @access  Private
const updateChat = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Atualização de chat será implementada em breve'
    });
  } catch (error) {
    console.error('Erro ao atualizar chat:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Deletar chat (placeholder)
// @route   DELETE /api/chats/:id
// @access  Private
const deleteChat = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Exclusão de chat será implementada em breve'
    });
  } catch (error) {
    console.error('Erro ao deletar chat:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Adicionar participante (placeholder)
// @route   POST /api/chats/:id/participants
// @access  Private
const addParticipant = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Adicionar participante será implementado em breve'
    });
  } catch (error) {
    console.error('Erro ao adicionar participante:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Remover participante (placeholder)
// @route   DELETE /api/chats/:id/participants/:userId
// @access  Private
const removeParticipant = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Remover participante será implementado em breve'
    });
  } catch (error) {
    console.error('Erro ao remover participante:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Marcar chat como lido
// @route   PUT /api/chats/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat não encontrado'
      });
    }
    
    // Verificar se o usuário faz parte do chat
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }
    
    // Zerar contador de não lidas
    chat.resetUnread(req.user._id);
    await chat.save();
    
    res.json({
      success: true,
      message: 'Chat marcado como lido'
    });
  } catch (error) {
    console.error('Erro ao marcar como lido:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getChats,
  createChat,
  getChatById,
  updateChat,
  deleteChat,
  addParticipant,
  removeParticipant,
  markAsRead
};
