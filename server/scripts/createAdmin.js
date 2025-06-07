const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Verificar se já existe um admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️ Já existe um usuário administrador:', existingAdmin.email);
      process.exit(0);
    }

    // Dados do admin padrão
    const adminData = {
      name: 'Administrador',
      email: 'admin@whatsclone.com',
      phone: '+5511999999999',
      password: 'admin123456', // Será hasheada automaticamente pelo modelo
      role: 'admin',
      isVerified: true,
      isOnline: false
    };

    // Criar usuário admin
    const admin = new User(adminData);
    await admin.save();

    console.log('🎉 Usuário administrador criado com sucesso!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Senha:', adminData.password);
    console.log('⚠️ IMPORTANTE: Altere a senha após o primeiro login!');

  } catch (error) {
    console.error('❌ Erro ao criar usuário administrador:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  createAdminUser();
}

module.exports = createAdminUser;
