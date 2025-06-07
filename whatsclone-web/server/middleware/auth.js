const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-verificationToken -tokenExpires');

    if (!user) {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        error: 'Usuário não verificado'
      });
    }

    req.user = user;
    next();
  } catch (error) {
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

module.exports = { auth, optionalAuth };