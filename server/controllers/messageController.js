const Message = require('../models/Message');
const Chat = require('../models/Chat');

// @desc    Obter mensagens de um chat
// @route   GET /api/messages/:chatId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Verificar se o usuário faz parte do chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado ao chat'
      });
    }
    
    const messages = await Message.find({ 
      chat: chatId,
      isDeleted: false 
    })
    .populate('sender', 'name avatar')
    .populate('replyTo', 'content sender')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    // Reverter ordem para mostrar mensagens mais antigas primeiro
    messages.reverse();
    
    res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao obter mensagens:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Enviar nova mensagem
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { chatId, content, type = 'text', replyTo } = req.body;
    
    // Verificar se o usuário faz parte do chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado ao chat'
      });
    }
    
    const message = new Message({
      chat: chatId,
      sender: req.user._id,
      content,
      type,
      replyTo
    });
    
    await message.save();
    await message.populate('sender', 'name avatar');
    
    if (replyTo) {
      await message.populate('replyTo', 'content sender');
    }
    
    res.status(201).json({
      success: true,
      message: 'Mensagem enviada com sucesso',
      data: message
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Editar mensagem
// @route   PUT /api/messages/:id
// @access  Private
const editMessage = async (req, res) => {
  try {
    const { content } = req.body;
    
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Mensagem não encontrada'
      });
    }
    
    // Verificar se o usuário é o remetente
    if (!message.sender.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: 'Apenas o remetente pode editar a mensagem'
      });
    }
    
    // Verificar se a mensagem não foi deletada
    if (message.isDeleted) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível editar mensagem deletada'
      });
    }
    
    message.editContent(content);
    await message.save();
    
    res.json({
      success: true,
      message: 'Mensagem editada com sucesso',
      data: message
    });
  } catch (error) {
    console.error('Erro ao editar mensagem:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Deletar mensagem
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Mensagem não encontrada'
      });
    }
    
    // Verificar se o usuário é o remetente
    if (!message.sender.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: 'Apenas o remetente pode deletar a mensagem'
      });
    }
    
    message.softDelete();
    await message.save();
    
    res.json({
      success: true,
      message: 'Mensagem deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar mensagem:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Marcar mensagem como lida
// @route   PUT /api/messages/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Mensagem não encontrada'
      });
    }
    
    // Não pode marcar própria mensagem como lida
    if (message.sender.equals(req.user._id)) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível marcar própria mensagem como lida'
      });
    }
    
    message.markAsRead(req.user._id);
    await message.save();
    
    res.json({
      success: true,
      message: 'Mensagem marcada como lida'
    });
  } catch (error) {
    console.error('Erro ao marcar como lida:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Marcar mensagem como entregue
// @route   PUT /api/messages/:id/delivered
// @access  Private
const markAsDelivered = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Mensagem não encontrada'
      });
    }
    
    // Não pode marcar própria mensagem como entregue
    if (message.sender.equals(req.user._id)) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível marcar própria mensagem como entregue'
      });
    }
    
    message.markAsDelivered(req.user._id);
    await message.save();
    
    res.json({
      success: true,
      message: 'Mensagem marcada como entregue'
    });
  } catch (error) {
    console.error('Erro ao marcar como entregue:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Upload de arquivo (placeholder)
// @route   POST /api/messages/upload
// @access  Private
const uploadFile = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Upload de arquivo será implementado em breve'
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
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markAsRead,
  markAsDelivered,
  uploadFile
};
