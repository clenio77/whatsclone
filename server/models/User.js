const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [50, 'Nome não pode ter mais de 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  phone: {
    type: String,
    required: [true, 'Telefone é obrigatório'],
    unique: true,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Formato de telefone inválido']
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres']
  },
  avatar: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: 'Disponível',
    maxlength: [100, 'Status não pode ter mais de 100 caracteres']
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lockReason: {
    type: String,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  tokenExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Índices para performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ isOnline: 1 });
userSchema.index({ lastSeen: -1 });

// Middleware para hash da senha
userSchema.pre('save', async function(next) {
  // Hash da senha se foi modificada
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  // Hash do token de verificação se foi modificado
  if (this.isModified('verificationToken') && this.verificationToken) {
    this.verificationToken = await bcrypt.hash(this.verificationToken, 12);
  }

  next();
});

// Método para verificar senha
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para verificar token
userSchema.methods.verifyToken = async function(token) {
  if (!this.verificationToken) return false;
  return await bcrypt.compare(token, this.verificationToken);
};

// Método para limpar dados sensíveis
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.verificationToken;
  delete user.tokenExpires;
  return user;
};

module.exports = mongoose.model('User', userSchema);