const twilio = require('twilio');

// Configuração do Twilio
const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER
};

// Verificar se as configurações estão presentes
const isTwilioConfigured = () => {
  return !!(twilioConfig.accountSid && twilioConfig.authToken && twilioConfig.phoneNumber);
};

// Criar cliente Twilio
let twilioClient = null;

if (isTwilioConfigured()) {
  try {
    twilioClient = twilio(twilioConfig.accountSid, twilioConfig.authToken);
    console.log('✅ Twilio configurado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao configurar Twilio:', error.message);
  }
} else {
  console.warn('⚠️ Twilio não configurado - SMS será simulado em desenvolvimento');
}

module.exports = {
  twilioClient,
  twilioConfig,
  isTwilioConfigured
};
