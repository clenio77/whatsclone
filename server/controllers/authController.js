const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSMS } = require('../utils/sms');
const { generateToken, generateRefreshToken } = require('../utils/jwt');

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validar dados obrigatórios
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: 'Nome, email, telefone e senha são obrigatórios'
      });
    }

    // Verificar se usuário já existe (por email ou telefone)
    let existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Usuário já existe com este email ou telefone'
      });
    }

    let user;
    if (existingUser && !existingUser.isVerified) {
      // Atualizar dados do usuário não verificado
      user = existingUser;
      user.name = name;
      user.email = email;
      user.phone = phone;
      user.password = password;
    } else {
      // Criar novo usuário
      user = new User({
        name,
        email,
        phone,
        password,
        isVerified: false
      });
    }

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Usuário registrado. Envie código de verificação.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);

    // Tratar erros de validação do MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `${field === 'email' ? 'Email' : 'Telefone'} já está em uso`
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Enviar código de verificação por SMS
// @route   POST /api/auth/send-verification
// @access  Public
const sendVerification = async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado. Registre-se primeiro.'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Usuário já está verificado'
      });
    }

    // Gerar código de verificação
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Salvar código e expiração
    user.verificationToken = verificationCode;
    user.tokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
    await user.save();

    // Enviar SMS
    const message = `Seu código de verificação WhatsClone: ${verificationCode}`;
    const smsSent = await sendSMS(phone, message);

    if (!smsSent) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao enviar SMS'
      });
    }

    res.json({
      success: true,
      message: 'Código de verificação enviado por SMS'
    });
  } catch (error) {
    console.error('Erro ao enviar verificação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Verificar código SMS e fazer login
// @route   POST /api/auth/verify
// @access  Public
const verifyPhone = async (req, res) => {
  try {
    const { phone, token } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Verificar se token não expirou
    if (user.tokenExpires < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Código de verificação expirado'
      });
    }

    // Verificar código
    const isValidToken = await user.verifyToken(token);
    if (!isValidToken) {
      return res.status(400).json({
        success: false,
        error: 'Código de verificação inválido'
      });
    }

    // Marcar como verificado
    user.isVerified = true;
    user.verificationToken = null;
    user.tokenExpires = null;
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Gerar tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Verificação bem-sucedida',
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          avatar: user.avatar,
          status: user.status,
          isOnline: user.isOnline
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Login com email e senha
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password, phone } = req.body;

    // Permitir login por email ou telefone
    let query = {};
    if (email) {
      query.email = email;
    } else if (phone) {
      query.phone = phone;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Email ou telefone é obrigatório'
      });
    }

    const user = await User.findOne(query);
    if (!user || !user.isVerified) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas ou usuário não verificado'
      });
    }

    // Verificar senha se fornecida
    if (password) {
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Credenciais inválidas'
        });
      }
    }

    // Atualizar status online
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Gerar tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          status: user.status,
          isOnline: user.isOnline,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Renovar token JWT
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token requerido'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isVerified) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }

    // Gerar novo access token
    const newAccessToken = generateToken(user._id);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
};

module.exports = {
  register,
  sendVerification,
  verifyPhone,
  login,
  refreshToken
};