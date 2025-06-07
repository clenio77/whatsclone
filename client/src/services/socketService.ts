import { io, Socket } from 'socket.io-client'
import { Message, User } from '@shared/types'
import { SOCKET_EVENTS } from '@shared/constants'

class SocketService {
  private socket: Socket | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  // Event listeners
  private eventListeners: Map<string, Function[]> = new Map()

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve()
        return
      }

      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
      })

      this.socket.on('connect', () => {
        console.log('✅ Socket conectado')
        this.isConnected = true
        this.reconnectAttempts = 0
        resolve()
      })

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket desconectado:', reason)
        this.isConnected = false
      })

      this.socket.on('connect_error', (error) => {
        console.error('❌ Erro de conexão socket:', error)
        this.reconnectAttempts++
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Falha ao conectar após múltiplas tentativas'))
        }
      })

      this.socket.on('error', (error) => {
        console.error('❌ Erro no socket:', error)
        this.emit('error', error)
      })

      // Configurar listeners de eventos
      this.setupEventListeners()
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.eventListeners.clear()
      console.log('🔌 Socket desconectado manualmente')
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return

    // Eventos de mensagem
    this.socket.on(SOCKET_EVENTS.NEW_MESSAGE, (message: Message) => {
      this.emit('newMessage', message)
    })

    this.socket.on(SOCKET_EVENTS.MESSAGE_READ, (data) => {
      this.emit('messageRead', data)
    })

    this.socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, (data) => {
      this.emit('messageDelivered', data)
    })

    // Eventos de digitação
    this.socket.on(SOCKET_EVENTS.USER_TYPING, (data) => {
      this.emit('userTyping', data)
    })

    // Eventos de usuário
    this.socket.on(SOCKET_EVENTS.USER_ONLINE, (data) => {
      this.emit('userOnline', data)
    })
  }

  // Métodos para enviar eventos
  joinChat(chatId: string): void {
    this.socket?.emit(SOCKET_EVENTS.JOIN_CHAT, chatId)
  }

  leaveChat(chatId: string): void {
    this.socket?.emit(SOCKET_EVENTS.LEAVE_CHAT, chatId)
  }

  sendMessage(data: {
    chatId: string
    content: string
    type?: string
    replyTo?: string
  }): void {
    this.socket?.emit(SOCKET_EVENTS.SEND_MESSAGE, data)
  }

  markAsRead(messageId: string, chatId: string): void {
    this.socket?.emit(SOCKET_EVENTS.MARK_AS_READ, { messageId, chatId })
  }

  startTyping(chatId: string): void {
    this.socket?.emit(SOCKET_EVENTS.TYPING_START, { chatId })
  }

  stopTyping(chatId: string): void {
    this.socket?.emit(SOCKET_EVENTS.TYPING_STOP, { chatId })
  }

  // Sistema de eventos personalizado
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  off(event: string, callback?: Function): void {
    if (!this.eventListeners.has(event)) return

    if (callback) {
      const listeners = this.eventListeners.get(event)!
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    } else {
      this.eventListeners.delete(event)
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  // Getters
  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true
  }

  get id(): string | undefined {
    return this.socket?.id
  }
}

// Instância singleton
export const socketService = new SocketService()

// Hook personalizado para usar o socket
export const useSocket = () => {
  return {
    socket: socketService,
    connected: socketService.connected,
    connect: socketService.connect.bind(socketService),
    disconnect: socketService.disconnect.bind(socketService),
    joinChat: socketService.joinChat.bind(socketService),
    leaveChat: socketService.leaveChat.bind(socketService),
    sendMessage: socketService.sendMessage.bind(socketService),
    markAsRead: socketService.markAsRead.bind(socketService),
    startTyping: socketService.startTyping.bind(socketService),
    stopTyping: socketService.stopTyping.bind(socketService),
    on: socketService.on.bind(socketService),
    off: socketService.off.bind(socketService),
  }
}
