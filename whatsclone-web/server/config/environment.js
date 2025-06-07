// Configurações de ambiente
const environment = {
  // Ambiente atual
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Servidor
  PORT: parseInt(process.env.PORT) || 5000,
  BASE_URL: process.env.BASE_URL || 'http://localhost:5000',
  
  // Banco de dados
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsclone',
  DB_NAME: process.env.DB_NAME || 'whatsclone',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // Logs
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Uploads
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '5MB',
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(',') || ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
  
  // Criptografia
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'your-encryption-key-here',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
  
  // HTTPS
  HTTPS_ENABLED: process.env.HTTPS_ENABLED === 'true'
};

// Função para validar configurações críticas
const validateEnvironment = () => {
  const errors = [];
  const warnings = [];
  
  // Validações críticas
  if (!environment.MONGODB_URI) {
    errors.push('MONGODB_URI é obrigatório');
  }
  
  if (environment.NODE_ENV === 'production') {
    if (environment.ENCRYPTION_KEY === 'your-encryption-key-here') {
      errors.push('ENCRYPTION_KEY deve ser alterado em produção');
    }
    
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-super-secret-jwt-key-here') {
      errors.push('JWT_SECRET deve ser configurado em produção');
    }
  }
  
  // Validações de aviso
  if (environment.NODE_ENV === 'development') {
    if (!process.env.TWILIO_ACCOUNT_SID) {
      warnings.push('TWILIO_ACCOUNT_SID não configurado - SMS será simulado');
    }
  }
  
  // Exibir erros e avisos
  if (errors.length > 0) {
    console.error('❌ Erros de configuração:');
    errors.forEach(error => console.error(`   - ${error}`));
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ Avisos de configuração:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }
  
  console.log(`✅ Ambiente configurado: ${environment.NODE_ENV}`);
};

// Função para obter configuração específica
const getConfig = (key) => {
  return environment[key];
};

// Função para verificar se está em produção
const isProduction = () => {
  return environment.NODE_ENV === 'production';
};

// Função para verificar se está em desenvolvimento
const isDevelopment = () => {
  return environment.NODE_ENV === 'development';
};

// Função para verificar se está em teste
const isTest = () => {
  return environment.NODE_ENV === 'test';
};

module.exports = {
  environment,
  validateEnvironment,
  getConfig,
  isProduction,
  isDevelopment,
  isTest
};
