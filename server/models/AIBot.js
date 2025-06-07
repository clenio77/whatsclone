const mongoose = require('mongoose');

const aiBotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome do bot é obrigatório'],
    trim: true,
    maxlength: [50, 'Nome não pode ter mais de 50 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
    maxlength: [200, 'Descrição não pode ter mais de 200 caracteres']
  },
  systemPrompt: {
    type: String,
    required: [true, 'Prompt do sistema é obrigatório'],
    maxlength: [2000, 'Prompt não pode ter mais de 2000 caracteres']
  },
  provider: {
    type: String,
    enum: ['openai', 'anthropic', 'groq', 'ollama'],
    default: 'groq'
  },
  model: {
    type: String,
    required: [true, 'Modelo é obrigatório']
  },
  avatar: {
    type: String,
    default: null
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  settings: {
    temperature: {
      type: Number,
      min: 0,
      max: 2,
      default: 0.7
    },
    maxTokens: {
      type: Number,
      min: 1,
      max: 4000,
      default: 1000
    },
    topP: {
      type: Number,
      min: 0,
      max: 1,
      default: 1
    },
    frequencyPenalty: {
      type: Number,
      min: -2,
      max: 2,
      default: 0
    },
    presencePenalty: {
      type: Number,
      min: -2,
      max: 2,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Índices
aiBotSchema.index({ creator: 1 });
aiBotSchema.index({ isPublic: 1, isActive: 1 });
aiBotSchema.index({ tags: 1 });
aiBotSchema.index({ 'rating.average': -1 });
aiBotSchema.index({ usageCount: -1 });

// Middleware para incrementar uso
aiBotSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Método para atualizar rating
aiBotSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + newRating) / this.rating.count;
  return this.save();
};

// Virtual para URL do avatar
aiBotSchema.virtual('avatarUrl').get(function() {
  if (this.avatar) {
    return this.avatar.startsWith('http') ? this.avatar : `/uploads/bots/${this.avatar}`;
  }
  return null;
});

// Método estático para buscar bots públicos
aiBotSchema.statics.findPublicBots = function(options = {}) {
  const { limit = 20, skip = 0, tags, sortBy = 'rating' } = options;
  
  let query = { isPublic: true, isActive: true };
  
  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }
  
  let sort = {};
  switch (sortBy) {
    case 'rating':
      sort = { 'rating.average': -1, 'rating.count': -1 };
      break;
    case 'usage':
      sort = { usageCount: -1 };
      break;
    case 'recent':
      sort = { createdAt: -1 };
      break;
    default:
      sort = { 'rating.average': -1 };
  }
  
  return this.find(query)
    .populate('creator', 'name avatar')
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

// Método estático para buscar por tags
aiBotSchema.statics.findByTags = function(tags) {
  return this.find({
    tags: { $in: tags },
    isPublic: true,
    isActive: true
  }).populate('creator', 'name avatar');
};

module.exports = mongoose.model('AIBot', aiBotSchema);
