import { useState, useEffect } from 'react'
import { Bot, Settings, Zap, MessageSquare, Languages, FileText, Lightbulb } from 'lucide-react'
import { aiService, AI_PROMPTS, type AIMessage } from '@/services/aiService'
import { useChatStore } from '@/services/chatStore'
import { useAuthStore } from '@/services/authStore'
import Button from '@/components/common/Button'
import Avatar from '@/components/common/Avatar'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
}

type AIMode = 'assistant' | 'translator' | 'summarizer' | 'creative'

const AI_MODES = {
  assistant: {
    name: 'Assistente Geral',
    icon: MessageSquare,
    prompt: AI_PROMPTS.ASSISTANT,
    description: 'Conversa geral e ajuda'
  },
  translator: {
    name: 'Tradutor',
    icon: Languages,
    prompt: AI_PROMPTS.TRANSLATOR,
    description: 'Tradução automática'
  },
  summarizer: {
    name: 'Resumidor',
    icon: FileText,
    prompt: AI_PROMPTS.SUMMARIZER,
    description: 'Resumos de texto'
  },
  creative: {
    name: 'Criativo',
    icon: Lightbulb,
    prompt: AI_PROMPTS.CREATIVE,
    description: 'Escrita criativa e ideias'
  }
}

const AIAssistant = ({ isOpen, onClose }: AIAssistantProps) => {
  const { user } = useAuthStore()
  const { selectedChat, sendMessage } = useChatStore()
  
  const [mode, setMode] = useState<AIMode>('assistant')
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversation, setConversation] = useState<AIMessage[]>([])
  const [showConfig, setShowConfig] = useState(false)

  // Verificar se AI está configurada
  const [isConfigured, setIsConfigured] = useState(aiService.isConfigured())
  const [config, setConfig] = useState(aiService.getConfig())

  useEffect(() => {
    setIsConfigured(aiService.isConfigured())
    setConfig(aiService.getConfig())
  }, [])

  // Resetar conversa quando mudar modo
  useEffect(() => {
    setConversation([
      { role: 'system', content: AI_MODES[mode].prompt }
    ])
  }, [mode])

  const handleSendToAI = async () => {
    if (!input.trim() || isLoading || !isConfigured) return

    const userMessage: AIMessage = { role: 'user', content: input.trim() }
    const newConversation = [...conversation, userMessage]
    
    setConversation(newConversation)
    setInput('')
    setIsLoading(true)

    try {
      const response = await aiService.chat(newConversation, {
        temperature: 0.7,
        maxTokens: 1000
      })

      const aiMessage: AIMessage = { role: 'assistant', content: response.content }
      setConversation(prev => [...prev, aiMessage])

    } catch (error) {
      console.error('Erro ao comunicar com AI:', error)
      toast.error('Erro ao comunicar com o assistente IA')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendToChat = (message: string) => {
    if (!selectedChat) {
      toast.error('Selecione uma conversa primeiro')
      return
    }

    sendMessage(message)
    toast.success('Mensagem enviada para o chat!')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendToAI()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-surface rounded-lg w-full max-w-2xl h-[80vh] flex flex-col mx-4">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-full">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
                Assistente IA
              </h3>
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                {AI_MODES[mode].description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfig(!showConfig)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        {/* Configuração */}
        {showConfig && (
          <div className="p-4 bg-gray-50 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                  Provedor: {config.provider}
                </label>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                  Modelo: {config.model}
                </label>
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    isConfigured ? 'bg-green-500' : 'bg-red-500'
                  )} />
                  <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                    {isConfigured ? 'Configurado' : 'Não configurado'}
                  </span>
                </div>
              </div>
              {!isConfigured && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Configure as variáveis de ambiente VITE_AI_PROVIDER e VITE_AI_API_KEY
                </p>
              )}
            </div>
          </div>
        )}

        {/* Modos */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(AI_MODES).map(([key, modeConfig]) => {
              const Icon = modeConfig.icon
              return (
                <button
                  key={key}
                  onClick={() => setMode(key as AIMode)}
                  className={cn(
                    'flex items-center space-x-2 p-2 rounded-lg text-sm transition-colors',
                    mode === key
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-dark-border text-gray-600 dark:text-dark-text-secondary'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{modeConfig.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Conversa */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversation.slice(1).map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] p-3 rounded-lg',
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-dark-border text-gray-900 dark:text-dark-text'
                )}
              >
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <Bot className="w-4 h-4 mt-0.5 text-blue-500" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.role === 'assistant' && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-dark-border">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSendToChat(message.content)}
                          className="text-xs"
                          disabled={!selectedChat}
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Enviar para chat
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-dark-border p-3 rounded-lg">
                <LoadingSpinner size="sm" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-dark-border">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder={
                isConfigured 
                  ? `Pergunte algo ao ${AI_MODES[mode].name.toLowerCase()}...`
                  : 'Configure a IA primeiro...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!isConfigured || isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text disabled:opacity-50"
            />
            <Button
              onClick={handleSendToAI}
              disabled={!input.trim() || !isConfigured || isLoading}
              size="sm"
            >
              <Zap className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant
