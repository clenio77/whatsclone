const jwt = require('jsonwebtoken');
const User = require('../models/User');
const tokenBlacklist = require('../services/tokenBlacklist');
const securityLogger = require('../services/securityLogger');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      securityLogger.logSecurityEvent('AUTH_NO_TOKEN', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.path
      });

      return res.status(401).json({
        error: 'Token de acesso requerido'
      });
    }

    // Verificar se token está na blacklist
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-verificationToken -tokenExpires');

    if (!user) {
      securityLogger.logSecurityEvent('AUTH_INVALID_USER', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: decoded.id,
        tokenHash: tokenBlacklist.getTokenHash(token)
      });

      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    if (!user.isVerified) {
      securityLogger.logSecurityEvent('AUTH_UNVERIFIED_USER', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: user._id
      });

      return res.status(401).json({
        error: 'Usuário não verificado'
      });
    }

    // Verificar se conta está bloqueada
    if (user.isLocked) {
      securityLogger.logSecurityEvent('AUTH_LOCKED_ACCOUNT', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: user._id
      });

      return res.status(423).json({
        error: 'Conta bloqueada por motivos de segurança'
      });
    }

    // Atualizar atividade da sessão
    tokenBlacklist.updateSessionActivity(user._id.toString(), token);

    // Adicionar informações de segurança ao request
    req.user = user;
    req.token = token;
    req.sessionId = tokenBlacklist.getTokenHash(token);

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      securityLogger.logSecurityEvent('AUTH_TOKEN_EXPIRED', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        expiredAt: error.expiredAt
      });

      return res.status(401).json({
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }

    securityLogger.logSecurityEvent('AUTH_ERROR', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      error: error.message
    });

    console.error('Erro na autenticação:', error);
    res.status(401).json({
      error: 'Token inválido'
    });
  }
};

// Middleware opcional - não falha se não houver token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-verificationToken -tokenExpires');

      if (user && user.isVerified) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Ignora erros de token em auth opcional
    next();
  }
};

// Middleware para verificar se usuário é admin
const adminAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Acesso negado'
      });
    }

    // Verificar se usuário é admin
    if (req.user.role !== 'admin') {
      securityLogger.logSecurityEvent('ADMIN_ACCESS_DENIED', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user._id,
        attemptedEndpoint: req.path
      });

      return res.status(403).json({
        error: 'Acesso negado - Privilégios de administrador necessários'
      });
    }

    securityLogger.logSecurityEvent('ADMIN_ACCESS_GRANTED', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user._id,
      endpoint: req.path
    });

    next();
  } catch (error) {
    console.error('Erro na verificação de admin:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = { auth, optionalAuth, adminAuth };