// Eventos do Socket.io
export const SOCKET_EVENTS = {
  // Conexão
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  // Chat
  JOIN_CHAT: 'join_chat',
  LEAVE_CHAT: 'leave_chat',

  // Mensagens
  SEND_MESSAGE: 'send_message',
  NEW_MESSAGE: 'new_message',
  EDIT_MESSAGE: 'edit_message',
  DELETE_MESSAGE: 'delete_message',

  // Status de mensagem
  MARK_AS_READ: 'mark_as_read',
  MARK_AS_DELIVERED: 'mark_as_delivered',
  MESSAGE_READ: 'message_read',
  MESSAGE_DELIVERED: 'message_delivered',

  // Digitação
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  USER_TYPING: 'user_typing',

  // Status do usuário
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',

  // Erros
  ERROR: 'error'
} as const;

// Status de mensagem
export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read'
} as const;

// Tipos de mensagem
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  AUDIO: 'audio',
  VIDEO: 'video'
} as const;

// Códigos de erro HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Mensagens de erro
export const ERROR_MESSAGES = {
  // Autenticação
  TOKEN_REQUIRED: 'Token de acesso requerido',
  TOKEN_INVALID: 'Token inválido',
  TOKEN_EXPIRED: 'Token expirado',
  USER_NOT_VERIFIED: 'Usuário não verificado',

  // Usuário
  USER_NOT_FOUND: 'Usuário não encontrado',
  USER_ALREADY_EXISTS: 'Usuário já existe',
  PHONE_INVALID: 'Formato de telefone inválido',

  // Chat
  CHAT_NOT_FOUND: 'Chat não encontrado',
  CHAT_ACCESS_DENIED: 'Acesso negado ao chat',
  CHAT_PARTICIPANTS_REQUIRED: 'Participantes são obrigatórios',

  // Mensagem
  MESSAGE_NOT_FOUND: 'Mensagem não encontrada',
  MESSAGE_CONTENT_REQUIRED: 'Conteúdo da mensagem é obrigatório',
  MESSAGE_ACCESS_DENIED: 'Acesso negado à mensagem',

  // Validação
  VALIDATION_ERROR: 'Dados inválidos',
  REQUIRED_FIELD: 'Campo obrigatório',

  // Servidor
  INTERNAL_ERROR: 'Erro interno do servidor',
  SERVICE_UNAVAILABLE: 'Serviço indisponível'
} as const;

// Mensagens de sucesso
export const SUCCESS_MESSAGES = {
  // Autenticação
  USER_REGISTERED: 'Usuário registrado com sucesso',
  VERIFICATION_SENT: 'Código de verificação enviado',
  VERIFICATION_SUCCESS: 'Verificação realizada com sucesso',
  LOGIN_SUCCESS: 'Login realizado com sucesso',

  // Chat
  CHAT_CREATED: 'Chat criado com sucesso',
  CHAT_UPDATED: 'Chat atualizado com sucesso',

  // Mensagem
  MESSAGE_SENT: 'Mensagem enviada com sucesso',
  MESSAGE_UPDATED: 'Mensagem atualizada com sucesso',
  MESSAGE_DELETED: 'Mensagem deletada com sucesso',

  // Perfil
  PROFILE_UPDATED: 'Perfil atualizado com sucesso'
} as const;

// Configurações padrão
export const DEFAULT_CONFIG = {
  // Paginação
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,

  // Limites
  MAX_MESSAGE_LENGTH: 1000,
  MAX_NAME_LENGTH: 50,
  MAX_STATUS_LENGTH: 100,
  MAX_GROUP_NAME_LENGTH: 50,

  // Timeouts
  VERIFICATION_TOKEN_EXPIRES: 10 * 60 * 1000, // 10 minutos
  JWT_EXPIRES: '7d',
  REFRESH_TOKEN_EXPIRES: '30d',

  // Rate limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutos
  RATE_LIMIT_MAX_REQUESTS: 100,

  // Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'gif'],
  ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx', 'txt']
} as const;