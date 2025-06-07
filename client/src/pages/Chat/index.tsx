import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { MessageCircle, Settings, Search, MoreVertical, Send, Plus, UserPlus, Bot } from 'lucide-react'
import { useAuthStore } from '@/services/authStore'
import { useSocket } from '@/services/socketService'
import { Chat, Message, User } from '@shared/types'
import { chatApi, messageApi, userApi } from '@/services/api'
import Avatar from '@/components/common/Avatar'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import AIAssistant from '@/components/chat/AIAssistant'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

const ChatPage = () => {
  const { chatId } = useParams()
  const { user, logout } = useAuthStore()
  const { socket, connect, connected, sendMessage, joinChat, leaveChat, on, off } = useSocket()

  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Carregar mensagens de um chat
  const loadMessages = async (chatId: string) => {
    try {
      const response = await messageApi.getMessages(chatId)
      if (response.success) {
        setMessages(response.data)
        setTimeout(scrollToBottom, 100)
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
      toast.error('Erro ao carregar mensagens')
    }
  }

  // Buscar usuários
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const response = await userApi.searchUsers(query)
      if (response.success) {
        setSearchResults(response.data)
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    }
  }

  // Criar novo chat
  const createNewChat = async (participantId: string) => {
    try {
      const response = await chatApi.createChat([participantId])
      if (response.success) {
        setChats(prev => [response.data, ...prev])
        setSelectedChat(response.data)
        setShowNewChatModal(false)
        setSearchQuery('')
        setSearchResults([])
        toast.success('Chat criado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao criar chat:', error)
      toast.error('Erro ao criar chat')
    }
  }

  // Conectar socket quando o usuário estiver autenticado
  useEffect(() => {
    if (user && !connected) {
      const authStore = JSON.parse(localStorage.getItem('auth-storage') || '{}')
      const token = authStore.state?.accessToken

      if (token) {
        connect(token).catch(console.error)
      }
    }
  }, [user, connected, connect])

  // Carregar chats
  useEffect(() => {
    const loadChats = async () => {
      try {
        const response = await chatApi.getChats()
        if (response.success) {
          setChats(response.data)
        }
      } catch (error) {
        console.error('Erro ao carregar chats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadChats()
    }
  }, [user])

  // Configurar event listeners do Socket.io
  useEffect(() => {
    if (!connected) return

    // Receber nova mensagem
    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message])

      // Atualizar último mensagem no chat
      setChats(prev => prev.map(chat =>
        chat.id === message.chat
          ? { ...chat, lastMessage: message, lastActivity: message.createdAt }
          : chat
      ))

      setTimeout(scrollToBottom, 100)
    }

    // Usuário digitando
    const handleUserTyping = (data: { userId: string; userName: string; isTyping: boolean }) => {
      if (data.userId === user?.id) return

      setTypingUsers(prev => {
        if (data.isTyping) {
          return prev.includes(data.userName) ? prev : [...prev, data.userName]
        } else {
          return prev.filter(name => name !== data.userName)
        }
      })
    }

    // Status online/offline
    const handleUserOnline = (data: { userId: string; isOnline: boolean }) => {
      setChats(prev => prev.map(chat => ({
        ...chat,
        participants: chat.participants.map(p =>
          p.id === data.userId ? { ...p, isOnline: data.isOnline } : p
        )
      })))
    }

    on('newMessage', handleNewMessage)
    on('userTyping', handleUserTyping)
    on('userOnline', handleUserOnline)

    return () => {
      off('newMessage', handleNewMessage)
      off('userTyping', handleUserTyping)
      off('userOnline', handleUserOnline)
    }
  }, [connected, user?.id, on, off])

  // Selecionar chat se chatId estiver na URL
  useEffect(() => {
    if (chatId && chats.length > 0) {
      const chat = chats.find(c => c.id === chatId)
      if (chat) {
        setSelectedChat(chat)
      }
    }
  }, [chatId, chats])

  // Carregar mensagens quando selecionar chat
  useEffect(() => {
    if (selectedChat && connected) {
      loadMessages(selectedChat.id)
      joinChat(selectedChat.id)

      return () => {
        leaveChat(selectedChat.id)
      }
    }
  }, [selectedChat, connected, joinChat, leaveChat])

  // Enviar mensagem
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat || !connected) return

    sendMessage({
      chatId: selectedChat.id,
      content: messageText.trim()
    })

    setMessageText('')

    // Parar indicador de digitação
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    socket?.stopTyping(selectedChat.id)
    setIsTyping(false)
  }

  // Gerenciar digitação
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMessageText(value)

    if (!selectedChat || !connected) return

    // Iniciar indicador de digitação
    if (!isTyping && value.trim()) {
      setIsTyping(true)
      socket?.startTyping(selectedChat.id)
    }

    // Parar indicador após 2 segundos sem digitar
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false)
        socket?.stopTyping(selectedChat.id)
      }
    }, 2000)
  }

  // Enviar com Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleLogout = () => {
    socket?.disconnect()
    logout()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-dark-bg">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar
                src={user?.avatar}
                name={user?.name}
                size="md"
                online={connected}
              />
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-dark-text">
                  {user?.name}
                </h2>
                <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                  {connected ? 'Online' : 'Conectando...'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewChatModal(true)}
                title="Nova conversa"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAIAssistant(true)}
                title="Assistente IA"
              >
                <Bot className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200 dark:border-dark-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-bg rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-light"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-dark-text-secondary">
                Nenhuma conversa ainda
              </p>
              <p className="text-sm text-gray-400 dark:text-dark-text-secondary mt-1">
                Comece uma nova conversa
              </p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  'chat-item',
                  selectedChat?.id === chat.id && 'active'
                )}
                onClick={() => setSelectedChat(chat)}
              >
                <Avatar
                  src={chat.isGroup ? chat.groupAvatar : chat.participants[0]?.avatar}
                  name={chat.isGroup ? chat.groupName : chat.participants[0]?.name}
                  size="md"
                  online={!chat.isGroup && chat.participants[0]?.isOnline}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-dark-text truncate">
                      {chat.isGroup ? chat.groupName : chat.participants[0]?.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
                      {chat.lastMessage && new Date(chat.lastActivity).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary truncate">
                    {chat.lastMessage?.content || 'Nenhuma mensagem'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={selectedChat.isGroup ? selectedChat.groupAvatar : selectedChat.participants[0]?.avatar}
                    name={selectedChat.isGroup ? selectedChat.groupName : selectedChat.participants[0]?.name}
                    size="md"
                    online={!selectedChat.isGroup && selectedChat.participants[0]?.isOnline}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text">
                      {selectedChat.isGroup ? selectedChat.groupName : selectedChat.participants[0]?.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                      {selectedChat.isGroup
                        ? `${selectedChat.participants.length} participantes`
                        : selectedChat.participants[0]?.isOnline
                          ? 'Online'
                          : `Visto por último ${new Date(selectedChat.participants[0]?.lastSeen).toLocaleString()}`
                      }
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-dark-bg">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-dark-text-secondary">
                    Nenhuma mensagem ainda
                  </p>
                  <p className="text-sm text-gray-400 dark:text-dark-text-secondary mt-1">
                    Envie uma mensagem para começar a conversa
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex',
                      message.sender.id === user?.id ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'message-bubble',
                        message.sender.id === user?.id ? 'message-sent' : 'message-received'
                      )}
                    >
                      {selectedChat.isGroup && message.sender.id !== user?.id && (
                        <p className="text-xs font-medium mb-1 text-whatsapp-dark">
                          {message.sender.name}
                        </p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-end mt-1 space-x-1">
                        <span className="text-xs opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {message.sender.id === user?.id && (
                          <span className="text-xs opacity-70">
                            {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Indicador de digitação */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="message-bubble message-received">
                    <div className="flex items-center space-x-2">
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {typingUsers.join(', ')} {typingUsers.length === 1 ? 'está' : 'estão'} digitando...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Digite uma mensagem..."
                  value={messageText}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-dark-bg rounded-full focus:outline-none focus:ring-2 focus:ring-whatsapp-light"
                  disabled={!connected}
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || !connected}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
            <div className="text-center">
              <MessageCircle className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-dark-text mb-2">
                WhatsClone Web
              </h2>
              <p className="text-gray-500 dark:text-dark-text-secondary max-w-md">
                Selecione uma conversa para começar a trocar mensagens ou inicie uma nova conversa.
              </p>
              <Button className="mt-6">
                Nova Conversa
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nova Conversa */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-surface rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
                Nova Conversa
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewChatModal(false)
                  setSearchQuery('')
                  setSearchResults([])
                }}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Buscar usuários..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  searchUsers(e.target.value)
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-light bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                autoFocus
              />

              <div className="max-h-60 overflow-y-auto space-y-2">
                {searchResults.length === 0 && searchQuery.length >= 2 ? (
                  <p className="text-center text-gray-500 dark:text-dark-text-secondary py-4">
                    Nenhum usuário encontrado
                  </p>
                ) : (
                  searchResults.map((searchUser) => (
                    <div
                      key={searchUser.id}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-dark-border rounded-lg cursor-pointer"
                      onClick={() => createNewChat(searchUser.id)}
                    >
                      <Avatar
                        src={searchUser.avatar}
                        name={searchUser.name}
                        size="md"
                        online={searchUser.isOnline}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-dark-text">
                          {searchUser.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                          {searchUser.phone}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assistente IA */}
      <AIAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />
    </div>
  )
}

export default ChatPage