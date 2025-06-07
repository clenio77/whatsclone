const twilio = require('twilio');

// Configurar cliente Twilio apenas se as credenciais estiverem disponíveis
let client = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Cliente Twilio configurado');
  } catch (error) {
    console.error('❌ Erro ao configurar cliente Twilio:', error);
  }
} else {
  console.warn('⚠️ Credenciais Twilio não configuradas - SMS será simulado');
}

// Enviar SMS
const sendSMS = async (to, message) => {
  try {
    // Em desenvolvimento ou sem cliente Twilio, apenas simular envio
    if (process.env.NODE_ENV === 'development' || !client) {
      console.log(`📱 SMS simulado para ${to}: ${message}`);
      return true;
    }

    // Validar configurações do Twilio
    if (!process.env.TWILIO_PHONE_NUMBER) {
      console.error('❌ TWILIO_PHONE_NUMBER não configurado');
      console.log(`📱 SMS simulado para ${to}: ${message}`);
      return true;
    }

    // Formatar número de telefone
    const formattedPhone = to.startsWith('+') ? to : `+${to}`;

    // Enviar SMS
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log(`✅ SMS enviado com sucesso. SID: ${result.sid}`);
    return true;

  } catch (error) {
    console.error('❌ Erro ao enviar SMS:', error);
    
    // Em desenvolvimento, retornar true mesmo com erro para não bloquear testes
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Modo desenvolvimento: SMS considerado como enviado');
      return true;
    }
    
    return false;
  }
};

// Validar número de telefone
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

// Formatar número de telefone
const formatPhoneNumber = (phone) => {
  // Remove todos os caracteres não numéricos exceto o +
  let formatted = phone.replace(/[^\d+]/g, '');
  
  // Adiciona + se não tiver
  if (!formatted.startsWith('+')) {
    formatted = `+${formatted}`;
  }
  
  return formatted;
};

module.exports = {
  sendSMS,
  validatePhoneNumber,
  formatPhoneNumber
};
