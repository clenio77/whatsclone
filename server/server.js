const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar e validar configurações
const { validateEnvironment } = require('./config/environment');
validateEnvironment();

const connectDB = require('./config/database');
const { initializeSocket } = require('./socket/socketHandler');

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chats');
const messageRoutes = require('./routes/messages');
const aiRoutes = require('./routes/ai');
const securityRoutes = require('./routes/security');
const adminRoutes = require('./routes/admin');

// Importar middlewares
const errorHandler = require('./middleware/errorHandler');
const {
  apiRateLimit,
  authRateLimit,
  messageRateLimit,
  aiRateLimit,
  sanitizeInput,
  validateInput,
  csrfProtection,
  attackDetection,
  securityHeaders,
  checkTokenBlacklist,
  securityLogging
} = require('./middleware/security');
const securityLogger = require('./services/securityLogger');

const app = express();
const server = http.createServer(app);

// Configuração do Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Conectar ao banco de dados
connectDB();

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(securityHeaders);
app.use(securityLogging);

// CORS (deve vir antes das proteções)
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ["http://localhost:3000", "http://localhost:5173"],
  credentials: true
}));

// Rate limiting e proteções
app.use('/api/', apiRateLimit);
app.use(sanitizeInput);
app.use(attackDetection);
app.use(csrfProtection);
app.use(checkTokenBlacklist);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing com validação
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: 'JSON inválido' });
      throw new Error('JSON inválido');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(validateInput);

// Rotas da API com rate limiting específico
app.use('/api/auth', authRateLimit, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRateLimit, messageRoutes);
app.use('/api/ai', aiRateLimit, aiRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/admin', adminRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota padrão
app.get('/', (req, res) => {
  res.json({
    message: 'WhatsClone API está funcionando!',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Inicializar Socket.io
initializeSocket(io);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

module.exports = { app, server, io };
