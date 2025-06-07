import { create } from 'zustand'
import { Chat, Message, User } from '@shared/types'
import { chatApi, messageApi } from './api'
import { socketService } from './socketService'
import toast from 'react-hot-toast'

interface ChatState {
  chats: Chat[]
  selectedChat: Chat | null
  messages: Message[]
  isLoading: boolean
  typingUsers: string[]
  onlineUsers: Set<string>
}

interface ChatActions {
  loadChats: () => Promise<void>
  selectChat: (chat: Chat) => void
  loadMessages: (chatId: string) => Promise<void>
  sendMessage: (content: string, type?: string) => void
  addMessage: (message: Message) => void
  updateTypingUsers: (userId: string, userName: string, isTyping: boolean) => void
  updateUserOnlineStatus: (userId: string, isOnline: boolean) => void
  createChat: (participantIds: string[]) => Promise<Chat | null>
  clearMessages: () => void
  reset: () => void
}

type ChatStore = ChatState & ChatActions

export const useChatStore = create<ChatStore>((set, get) => ({
  // State
  chats: [],
  selectedChat: null,
  messages: [],
  isLoading: false,
  typingUsers: [],
  onlineUsers: new Set(),

  // Actions
  loadChats: async () => {
    set({ isLoading: true })
    try {
      const response = await chatApi.getChats()
      if (response.success) {
        set({ chats: response.data })
      }
    } catch (error) {
      console.error('Erro ao carregar chats:', error)
      toast.error('Erro ao carregar conversas')
    } finally {
      set({ isLoading: false })
    }
  },

  selectChat: (chat: Chat) => {
    const { selectedChat } = get()
    
    // Sair do chat anterior
    if (selectedChat) {
      socketService.leaveChat(selectedChat.id)
    }
    
    // Entrar no novo chat
    socketService.joinChat(chat.id)
    
    set({ 
      selectedChat: chat,
      messages: [],
      typingUsers: []
    })
    
    // Carregar mensagens
    get().loadMessages(chat.id)
  },

  loadMessages: async (chatId: string) => {
    try {
      const response = await messageApi.getMessages(chatId)
      if (response.success) {
        set({ messages: response.data })
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
      toast.error('Erro ao carregar mensagens')
    }
  },

  sendMessage: (content: string, type = 'text') => {
    const { selectedChat } = get()
    if (!selectedChat || !content.trim()) return

    socketService.sendMessage({
      chatId: selectedChat.id,
      content: content.trim(),
      type
    })
  },

  addMessage: (message: Message) => {
    set(state => ({
      messages: [...state.messages, message],
      chats: state.chats.map(chat => 
        chat.id === message.chat
          ? { ...chat, lastMessage: message, lastActivity: message.createdAt }
          : chat
      )
    }))
  },

  updateTypingUsers: (userId: string, userName: string, isTyping: boolean) => {
    set(state => {
      const typingUsers = isTyping
        ? state.typingUsers.includes(userName) 
          ? state.typingUsers 
          : [...state.typingUsers, userName]
        : state.typingUsers.filter(name => name !== userName)
      
      return { typingUsers }
    })
  },

  updateUserOnlineStatus: (userId: string, isOnline: boolean) => {
    set(state => ({
      onlineUsers: isOnline 
        ? new Set([...state.onlineUsers, userId])
        : new Set([...state.onlineUsers].filter(id => id !== userId)),
      chats: state.chats.map(chat => ({
        ...chat,
        participants: chat.participants.map(p => 
          p.id === userId ? { ...p, isOnline } : p
        )
      }))
    }))
  },

  createChat: async (participantIds: string[]) => {
    try {
      const response = await chatApi.createChat(participantIds)
      if (response.success) {
        set(state => ({
          chats: [response.data, ...state.chats]
        }))
        return response.data
      }
    } catch (error) {
      console.error('Erro ao criar chat:', error)
      toast.error('Erro ao criar conversa')
    }
    return null
  },

  clearMessages: () => {
    set({ messages: [], typingUsers: [] })
  },

  reset: () => {
    const { selectedChat } = get()
    if (selectedChat) {
      socketService.leaveChat(selectedChat.id)
    }
    
    set({
      chats: [],
      selectedChat: null,
      messages: [],
      isLoading: false,
      typingUsers: [],
      onlineUsers: new Set()
    })
  }
}))

// Hook para configurar listeners do Socket.io
export const useChatSocketListeners = () => {
  const { addMessage, updateTypingUsers, updateUserOnlineStatus } = useChatStore()

  const setupListeners = () => {
    // Nova mensagem
    socketService.on('newMessage', (message: Message) => {
      addMessage(message)
    })

    // Usuário digitando
    socketService.on('userTyping', (data: { userId: string; userName: string; isTyping: boolean }) => {
      updateTypingUsers(data.userId, data.userName, data.isTyping)
    })

    // Status online/offline
    socketService.on('userOnline', (data: { userId: string; isOnline: boolean }) => {
      updateUserOnlineStatus(data.userId, data.isOnline)
    })
  }

  const removeListeners = () => {
    socketService.off('newMessage')
    socketService.off('userTyping')
    socketService.off('userOnline')
  }

  return { setupListeners, removeListeners }
}
