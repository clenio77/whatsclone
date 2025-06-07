const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const validator = require('validator');
const crypto = require('crypto');
const tokenBlacklist = require('../services/tokenBlacklist');
const securityLogger = require('../services/securityLogger');

// Rate limiting avançado por endpoint
const createRateLimit = (windowMs, max, message, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req, res) => {
      securityLogger.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.path,
        method: req.method
      });
      
      res.status(429).json({
        error: message,
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// Rate limits específicos
const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  5, // 5 tentativas
  'Muitas tentativas de login. Tente novamente em 15 minutos.',
  true
);

const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  100, // 100 requests
  'Muitas requisições. Tente novamente em alguns minutos.'
);

const messageRateLimit = createRateLimit(
  60 * 1000, // 1 minuto
  30, // 30 mensagens por minuto
  'Muitas mensagens enviadas. Aguarde um momento.'
);

const aiRateLimit = createRateLimit(
  60 * 1000, // 1 minuto
  10, // 10 requests de IA por minuto
  'Muitas requisições para IA. Aguarde um momento.'
);

// Slow down para endpoints sensíveis
const authSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 2, // Começar delay após 2 requests
  delayMs: 500, // Aumentar 500ms a cada request
  maxDelayMs: 20000, // Máximo 20 segundos de delay
});

// Sanitização avançada de dados
const sanitizeInput = (req, res, next) => {
  // Sanitizar contra NoSQL injection
  mongoSanitize()(req, res, () => {
    // Sanitizar contra XSS
    const sanitizeObject = (obj) => {
      if (typeof obj === 'string') {
        return xss(obj, {
          whiteList: {}, // Não permitir nenhuma tag HTML
          stripIgnoreTag: true,
          stripIgnoreTagBody: ['script']
        });
      }
      
      if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          obj[key] = sanitizeObject(obj[key]);
        }
      }
      
      return obj;
    };

    if (req.body) req.body = sanitizeObject(req.body);
    if (req.query) req.query = sanitizeObject(req.query);
    if (req.params) req.params = sanitizeObject(req.params);

    next();
  });
};

// Validação de entrada avançada
const validateInput = (req, res, next) => {
  const errors = [];

  // Validar tamanhos máximos
  const checkLength = (value, maxLength, fieldName) => {
    if (typeof value === 'string' && value.length > maxLength) {
      errors.push(`${fieldName} excede o tamanho máximo de ${maxLength} caracteres`);
    }
  };

  // Validar campos comuns
  if (req.body.name) {
    checkLength(req.body.name, 50, 'Nome');
    if (!validator.isAlpha(req.body.name.replace(/\s/g, ''), 'pt-BR')) {
      errors.push('Nome deve conter apenas letras');
    }
  }

  if (req.body.email) {
    if (!validator.isEmail(req.body.email)) {
      errors.push('Email inválido');
    }
  }

  if (req.body.phone) {
    if (!validator.isMobilePhone(req.body.phone, 'any')) {
      errors.push('Número de telefone inválido');
    }
  }

  if (req.body.content) {
    checkLength(req.body.content, 1000, 'Conteúdo da mensagem');
  }

  if (errors.length > 0) {
    securityLogger.logSecurityEvent('VALIDATION_FAILED', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      errors,
      body: req.body
    });

    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors
    });
  }

  next();
};

// Proteção CSRF
const csrfProtection = (req, res, next) => {
  // Pular para métodos seguros
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Verificar origem
  const origin = req.get('Origin') || req.get('Referer');
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
  
  if (!origin || !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    securityLogger.logSecurityEvent('CSRF_ATTEMPT', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      origin,
      allowedOrigins
    });

    return res.status(403).json({
      error: 'Origem não permitida'
    });
  }

  next();
};

// Detecção de ataques
const attackDetection = (req, res, next) => {
  const suspiciousPatterns = [
    /(\<script\>|\<\/script\>)/gi, // XSS
    /(union|select|insert|delete|update|drop|create|alter)/gi, // SQL Injection
    /(\$where|\$ne|\$gt|\$lt|\$regex)/gi, // NoSQL Injection
    /(javascript:|data:|vbscript:)/gi, // Protocol injection
    /(\.\.\/|\.\.\\)/g, // Path traversal
  ];

  const checkForAttacks = (obj, path = '') => {
    if (typeof obj === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(obj)) {
          securityLogger.logSecurityEvent('ATTACK_DETECTED', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            pattern: pattern.toString(),
            value: obj,
            path: path,
            endpoint: req.path
          });

          return true;
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (checkForAttacks(obj[key], `${path}.${key}`)) {
          return true;
        }
      }
    }
    return false;
  };

  if (checkForAttacks(req.body, 'body') || 
      checkForAttacks(req.query, 'query') || 
      checkForAttacks(req.params, 'params')) {
    
    return res.status(400).json({
      error: 'Conteúdo suspeito detectado'
    });
  }

  next();
};

// Middleware de segurança para headers
const securityHeaders = (req, res, next) => {
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' ws: wss:; " +
    "frame-ancestors 'none';"
  );

  // Outros headers de segurança
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
};

// Middleware para verificar blacklist de tokens
const checkTokenBlacklist = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    const isBlacklisted = await tokenBlacklist.isBlacklisted(token);
    if (isBlacklisted) {
      securityLogger.logSecurityEvent('BLACKLISTED_TOKEN_USED', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        tokenHash: tokenBlacklist.getTokenHash(token)
      });

      return res.status(401).json({
        error: 'Token revogado'
      });
    }

    // Atualizar atividade da sessão se usuário autenticado
    if (req.user) {
      tokenBlacklist.updateSessionActivity(req.user._id.toString(), token);
    }
  }

  next();
};

// Middleware para logging de segurança
const securityLogging = (req, res, next) => {
  // Log de tentativas de acesso a endpoints sensíveis
  const sensitiveEndpoints = ['/api/auth', '/api/admin', '/api/users'];
  
  if (sensitiveEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    securityLogger.logSecurityEvent('SENSITIVE_ENDPOINT_ACCESS', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
      method: req.method,
      userId: req.user?._id
    });
  }

  next();
};

module.exports = {
  authRateLimit,
  apiRateLimit,
  messageRateLimit,
  aiRateLimit,
  authSlowDown,
  sanitizeInput,
  validateInput,
  csrfProtection,
  attackDetection,
  securityHeaders,
  checkTokenBlacklist,
  securityLogging
};
