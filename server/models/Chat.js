const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    trim: true,
    maxlength: [50, 'Nome do grupo não pode ter mais de 50 caracteres']
  },
  groupAvatar: {
    type: String,
    default: null
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  unreadCount: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    count: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

// Índices para performance
chatSchema.index({ participants: 1 });
chatSchema.index({ lastActivity: -1 });
chatSchema.index({ isGroup: 1 });

// Middleware para validar participantes
chatSchema.pre('save', function(next) {
  if (this.participants.length < 2) {
    return next(new Error('Chat deve ter pelo menos 2 participantes'));
  }
  
  if (this.isGroup && !this.groupName) {
    return next(new Error('Grupos devem ter um nome'));
  }
  
  if (this.isGroup && !this.groupAdmin) {
    return next(new Error('Grupos devem ter um administrador'));
  }
  
  next();
});

// Método para adicionar participante
chatSchema.methods.addParticipant = function(userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    this.unreadCount.push({ user: userId, count: 0 });
  }
};

// Método para remover participante
chatSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => !p.equals(userId));
  this.unreadCount = this.unreadCount.filter(u => !u.user.equals(userId));
};

// Método para incrementar contador de não lidas
chatSchema.methods.incrementUnread = function(userId) {
  const userUnread = this.unreadCount.find(u => u.user.equals(userId));
  if (userUnread) {
    userUnread.count += 1;
  } else {
    this.unreadCount.push({ user: userId, count: 1 });
  }
};

// Método para zerar contador de não lidas
chatSchema.methods.resetUnread = function(userId) {
  const userUnread = this.unreadCount.find(u => u.user.equals(userId));
  if (userUnread) {
    userUnread.count = 0;
  }
};

module.exports = mongoose.model('Chat', chatSchema);
