const { body, validationResult } = require('express-validator');

// Middleware para verificar resultados da validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: errors.array()
    });
  }
  next();
};

// Validações para registro/login
const validatePhone = [
  body('phone')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Formato de telefone inválido')
    .isLength({ min: 10, max: 15 })
    .withMessage('Telefone deve ter entre 10 e 15 dígitos'),
  handleValidationErrors
];

const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),
  
  body('phone')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Formato de telefone inválido')
    .isLength({ min: 10, max: 15 })
    .withMessage('Telefone deve ter entre 10 e 15 dígitos'),
  
  handleValidationErrors
];

const validateVerification = [
  body('phone')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Formato de telefone inválido'),
  
  body('token')
    .isLength({ min: 4, max: 6 })
    .withMessage('Token deve ter entre 4 e 6 dígitos')
    .isNumeric()
    .withMessage('Token deve conter apenas números'),
  
  handleValidationErrors
];

// Validações para mensagens
const validateMessage = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Mensagem deve ter entre 1 e 1000 caracteres'),
  
  body('type')
    .optional()
    .isIn(['text', 'image', 'file', 'audio', 'video'])
    .withMessage('Tipo de mensagem inválido'),
  
  handleValidationErrors
];

// Validações para chat
const validateCreateChat = [
  body('participants')
    .isArray({ min: 1 })
    .withMessage('Deve haver pelo menos um participante')
    .custom((participants) => {
      if (participants.some(p => typeof p !== 'string' || p.length !== 24)) {
        throw new Error('IDs de participantes inválidos');
      }
      return true;
    }),
  
  body('isGroup')
    .optional()
    .isBoolean()
    .withMessage('isGroup deve ser um boolean'),
  
  body('groupName')
    .if(body('isGroup').equals(true))
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Nome do grupo deve ter entre 1 e 50 caracteres'),
  
  handleValidationErrors
];

// Validações para perfil
const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),
  
  body('status')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Status não pode ter mais de 100 caracteres'),
  
  handleValidationErrors
];

module.exports = {
  validatePhone,
  validateRegister,
  validateVerification,
  validateMessage,
  validateCreateChat,
  validateUpdateProfile,
  handleValidationErrors
};
