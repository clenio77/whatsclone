// Configurações JWT
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-here',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshExpiresIn: '30d'
};

// Verificar se as configurações estão seguras
const validateJWTConfig = () => {
  const warnings = [];
  
  if (jwtConfig.secret === 'your-super-secret-jwt-key-here') {
    warnings.push('JWT_SECRET está usando valor padrão - altere para produção');
  }
  
  if (jwtConfig.refreshSecret === 'your-refresh-token-secret-here') {
    warnings.push('JWT_REFRESH_SECRET está usando valor padrão - altere para produção');
  }
  
  if (jwtConfig.secret.length < 32) {
    warnings.push('JWT_SECRET deve ter pelo menos 32 caracteres');
  }
  
  if (process.env.NODE_ENV === 'production' && warnings.length > 0) {
    console.error('❌ Configurações JWT inseguras em produção:');
    warnings.forEach(warning => console.error(`   - ${warning}`));
    process.exit(1);
  } else if (warnings.length > 0) {
    console.warn('⚠️ Avisos de configuração JWT:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }
};

// Validar configurações na inicialização
validateJWTConfig();

module.exports = jwtConfig;
