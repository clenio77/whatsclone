// Tipos do usuário
export interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  status: string;
  isOnline: boolean;
  lastSeen: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de mensagem
export interface Message {
  id: string;
  chat: string;
  sender: User;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  status: 'sent' | 'delivered' | 'read';
  readBy: Array<{
    user: string;
    readAt: Date;
  }>;
  deliveredTo: Array<{
    user: string;
    deliveredAt: Date;
  }>;
  replyTo?: Message;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de chat
export interface Chat {
  id: string;
  participants: User[];
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  groupAdmin?: User;
  lastMessage?: Message;
  lastActivity: Date;
  unreadCount: Array<{
    user: string;
    count: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de autenticação
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface LoginRequest {
  phone: string;
}

export interface RegisterRequest {
  name: string;
  phone: string;
}

export interface VerificationRequest {
  phone: string;
  token: string;
}

// Tipos de API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any[];
}

export interface PaginationResponse<T = any> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

// Tipos de Socket.io
export interface SocketEvents {
  // Eventos de conexão
  connect: () => void;
  disconnect: () => void;

  // Eventos de chat
  join_chat: (chatId: string) => void;
  leave_chat: (chatId: string) => void;

  // Eventos de mensagem
  send_message: (data: {
    chatId: string;
    content: string;
    type?: string;
    replyTo?: string;
  }) => void;
  new_message: (message: Message) => void;

  // Eventos de status
  mark_as_read: (data: { messageId: string; chatId: string }) => void;
  message_read: (data: { messageId: string; readBy: string; readAt: Date }) => void;

  // Eventos de digitação
  typing_start: (data: { chatId: string }) => void;
  typing_stop: (data: { chatId: string }) => void;
  user_typing: (data: { userId: string; userName: string; isTyping: boolean }) => void;

  // Eventos de usuário
  user_online: (data: { userId: string; isOnline: boolean; lastSeen?: Date }) => void;

  // Eventos de erro
  error: (data: { message: string }) => void;
}