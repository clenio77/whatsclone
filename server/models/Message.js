const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Conteúdo da mensagem é obrigatório'],
    trim: true,
    maxlength: [1000, 'Mensagem não pode ter mais de 1000 caracteres']
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'video'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  deliveredTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveredAt: {
      type: Date,
      default: Date.now
    }
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Índices para performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ createdAt: -1 });

// Middleware para atualizar lastMessage no chat
messageSchema.post('save', async function() {
  try {
    const Chat = mongoose.model('Chat');
    await Chat.findByIdAndUpdate(this.chat, {
      lastMessage: this._id,
      lastActivity: this.createdAt
    });
  } catch (error) {
    console.error('Erro ao atualizar lastMessage:', error);
  }
});

// Método para marcar como lida
messageSchema.methods.markAsRead = function(userId) {
  const alreadyRead = this.readBy.find(r => r.user.equals(userId));
  if (!alreadyRead) {
    this.readBy.push({ user: userId, readAt: new Date() });
    this.status = 'read';
  }
};

// Método para marcar como entregue
messageSchema.methods.markAsDelivered = function(userId) {
  const alreadyDelivered = this.deliveredTo.find(d => d.user.equals(userId));
  if (!alreadyDelivered) {
    this.deliveredTo.push({ user: userId, deliveredAt: new Date() });
    if (this.status === 'sent') {
      this.status = 'delivered';
    }
  }
};

// Método para editar mensagem
messageSchema.methods.editContent = function(newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
};

// Método para deletar mensagem
messageSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.content = 'Esta mensagem foi deletada';
};

module.exports = mongoose.model('Message', messageSchema);
