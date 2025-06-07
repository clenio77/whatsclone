const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const testUsers = [
  {
    name: 'João Silva',
    email: 'joao@teste.com',
    phone: '+5511987654321',
    password: '123456789',
    role: 'user',
    isVerified: true
  },
  {
    name: 'Maria Santos',
    email: 'maria@teste.com',
    phone: '+5511987654322',
    password: '123456789',
    role: 'user',
    isVerified: true
  },
  {
    name: 'Pedro Costa',
    email: 'pedro@teste.com',
    phone: '+5511987654323',
    password: '123456789',
    role: 'user',
    isVerified: true
  },
  {
    name: 'Ana Oliveira',
    email: 'ana@teste.com',
    phone: '+5511987654324',
    password: '123456789',
    role: 'user',
    isVerified: true
  },
  {
    name: 'Carlos Ferreira',
    email: 'carlos@teste.com',
    phone: '+5511987654325',
    password: '123456789',
    role: 'user',
    isVerified: true
  }
];

const createTestUsers = async () => {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    console.log('🧪 Criando usuários de teste...');

    for (const userData of testUsers) {
      // Verificar se usuário já existe
      const existingUser = await User.findOne({ 
        $or: [
          { email: userData.email },
          { phone: userData.phone }
        ]
      });

      if (existingUser) {
        console.log(`⚠️ Usuário já existe: ${userData.email}`);
        continue;
      }

      // Criar usuário
      const user = new User(userData);
      await user.save();

      console.log(`✅ Usuário criado: ${userData.name} (${userData.email})`);
    }

    console.log('\n🎉 Usuários de teste criados com sucesso!');
    console.log('\n📋 CREDENCIAIS PARA LOGIN:');
    console.log('================================');
    
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Senha: ${user.password}`);
      console.log(`   📱 Telefone: ${user.phone}`);
      console.log('');
    });

    console.log('💡 COMO USAR:');
    console.log('1. Acesse http://localhost:3000');
    console.log('2. Clique em "Entrar" ou "Login"');
    console.log('3. Use qualquer email e senha acima');
    console.log('4. Teste conversas entre diferentes usuários');

  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  createTestUsers();
}

module.exports = createTestUsers;
