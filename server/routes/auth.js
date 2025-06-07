const express = require('express');
const router = express.Router();
const { register, sendVerification, verifyPhone, login, refreshToken } = require('../controllers/authController');
const { validateRegister, validatePhone, validateVerification } = require('../middleware/validation');

// @route   POST /api/auth/register
// @desc    Registrar novo usuário
// @access  Public
router.post('/register', validateRegister, register);

// @route   POST /api/auth/send-verification
// @desc    Enviar código de verificação por SMS
// @access  Public
router.post('/send-verification', validatePhone, sendVerification);

// @route   POST /api/auth/verify
// @desc    Verificar código SMS e fazer login
// @access  Public
router.post('/verify', validateVerification, verifyPhone);

// @route   POST /api/auth/login
// @desc    Login com telefone (se já verificado)
// @access  Public
router.post('/login', validatePhone, login);

// @route   POST /api/auth/refresh
// @desc    Renovar token JWT
// @access  Public
router.post('/refresh', refreshToken);

module.exports = router;