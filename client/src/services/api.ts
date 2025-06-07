import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { ApiResponse, User, Chat, Message } from '@shared/types'

// Configuração base do Axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autorização
api.interceptors.request.use(
  (config) => {
    const authStore = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const token = authStore.state?.accessToken
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Se o token expirou (401) e não é uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const authStore = JSON.parse(localStorage.getItem('auth-storage') || '{}')
        const refreshToken = authStore.state?.refreshToken
        
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          })
          
          if (response.data.success) {
            const newToken = response.data.data.accessToken
            
            // Atualizar token no localStorage
            authStore.state.accessToken = newToken
            localStorage.setItem('auth-storage', JSON.stringify(authStore))
            
            // Repetir a requisição original com o novo token
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api(originalRequest)
          }
        }
      } catch (refreshError) {
        // Refresh falhou, limpar dados de auth
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

// Serviços de autenticação
export const authApi = {
  register: (name: string, phone: string): Promise<ApiResponse> =>
    api.post('/auth/register', { name, phone }).then(res => res.data),
    
  sendVerification: (phone: string): Promise<ApiResponse> =>
    api.post('/auth/send-verification', { phone }).then(res => res.data),
    
  verifyPhone: (phone: string, token: string): Promise<ApiResponse> =>
    api.post('/auth/verify', { phone, token }).then(res => res.data),
    
  login: (phone: string): Promise<ApiResponse> =>
    api.post('/auth/login', { phone }).then(res => res.data),
    
  refreshToken: (refreshToken: string): Promise<ApiResponse> =>
    api.post('/auth/refresh', { refreshToken }).then(res => res.data),
    
  getProfile: (): Promise<ApiResponse<User>> =>
    api.get('/users/profile').then(res => res.data),
    
  updateProfile: (data: Partial<User>): Promise<ApiResponse<User>> =>
    api.put('/users/profile', data).then(res => res.data),
}

// Serviços de usuários
export const userApi = {
  searchUsers: (query: string): Promise<ApiResponse<User[]>> =>
    api.get(`/users/search?q=${encodeURIComponent(query)}`).then(res => res.data),
    
  updateOnlineStatus: (isOnline: boolean): Promise<ApiResponse> =>
    api.put('/users/online-status', { isOnline }).then(res => res.data),
}

// Serviços de chat
export const chatApi = {
  getChats: (): Promise<ApiResponse<Chat[]>> =>
    api.get('/chats').then(res => res.data),
    
  createChat: (participants: string[], isGroup?: boolean, groupName?: string): Promise<ApiResponse<Chat>> =>
    api.post('/chats', { participants, isGroup, groupName }).then(res => res.data),
    
  getChatById: (chatId: string): Promise<ApiResponse<Chat>> =>
    api.get(`/chats/${chatId}`).then(res => res.data),
    
  markAsRead: (chatId: string): Promise<ApiResponse> =>
    api.put(`/chats/${chatId}/read`).then(res => res.data),
}

// Serviços de mensagens
export const messageApi = {
  getMessages: (chatId: string, page = 1, limit = 50): Promise<ApiResponse<Message[]>> =>
    api.get(`/messages/${chatId}?page=${page}&limit=${limit}`).then(res => res.data),
    
  sendMessage: (chatId: string, content: string, type = 'text', replyTo?: string): Promise<ApiResponse<Message>> =>
    api.post('/messages', { chatId, content, type, replyTo }).then(res => res.data),
    
  editMessage: (messageId: string, content: string): Promise<ApiResponse<Message>> =>
    api.put(`/messages/${messageId}`, { content }).then(res => res.data),
    
  deleteMessage: (messageId: string): Promise<ApiResponse> =>
    api.delete(`/messages/${messageId}`).then(res => res.data),
    
  markAsRead: (messageId: string): Promise<ApiResponse> =>
    api.put(`/messages/${messageId}/read`).then(res => res.data),
    
  markAsDelivered: (messageId: string): Promise<ApiResponse> =>
    api.put(`/messages/${messageId}/delivered`).then(res => res.data),
}

export default api
