import axios from 'axios'

// Configurações para diferentes provedores de LLM
const AI_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GROQ: 'groq',
  OLLAMA: 'ollama'
} as const

type AIProvider = typeof AI_PROVIDERS[keyof typeof AI_PROVIDERS]

interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AIResponse {
  content: string
  provider: AIProvider
  model: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

class AIService {
  private provider: AIProvider
  private apiKey: string
  private baseURL: string
  private model: string

  constructor() {
    // Configuração padrão - pode ser alterada via configurações
    this.provider = (import.meta.env.VITE_AI_PROVIDER as AIProvider) || AI_PROVIDERS.GROQ
    this.apiKey = import.meta.env.VITE_AI_API_KEY || ''
    this.baseURL = this.getBaseURL()
    this.model = this.getDefaultModel()
  }

  private getBaseURL(): string {
    switch (this.provider) {
      case AI_PROVIDERS.OPENAI:
        return 'https://api.openai.com/v1'
      case AI_PROVIDERS.ANTHROPIC:
        return 'https://api.anthropic.com/v1'
      case AI_PROVIDERS.GROQ:
        return 'https://api.groq.com/openai/v1'
      case AI_PROVIDERS.OLLAMA:
        return import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434'
      default:
        return 'https://api.groq.com/openai/v1'
    }
  }

  private getDefaultModel(): string {
    switch (this.provider) {
      case AI_PROVIDERS.OPENAI:
        return 'gpt-3.5-turbo'
      case AI_PROVIDERS.ANTHROPIC:
        return 'claude-3-haiku-20240307'
      case AI_PROVIDERS.GROQ:
        return 'llama3-8b-8192'
      case AI_PROVIDERS.OLLAMA:
        return 'llama3'
      default:
        return 'llama3-8b-8192'
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    switch (this.provider) {
      case AI_PROVIDERS.OPENAI:
      case AI_PROVIDERS.GROQ:
        headers['Authorization'] = `Bearer ${this.apiKey}`
        break
      case AI_PROVIDERS.ANTHROPIC:
        headers['x-api-key'] = this.apiKey
        headers['anthropic-version'] = '2023-06-01'
        break
    }

    return headers
  }

  async chat(messages: AIMessage[], options?: {
    temperature?: number
    maxTokens?: number
    stream?: boolean
  }): Promise<AIResponse> {
    try {
      const response = await this.makeRequest(messages, options)
      return response
    } catch (error) {
      console.error('Erro na requisição AI:', error)
      throw new Error('Falha ao comunicar com o serviço de IA')
    }
  }

  private async makeRequest(messages: AIMessage[], options?: {
    temperature?: number
    maxTokens?: number
    stream?: boolean
  }): Promise<AIResponse> {
    const { temperature = 0.7, maxTokens = 1000, stream = false } = options || {}

    switch (this.provider) {
      case AI_PROVIDERS.OPENAI:
      case AI_PROVIDERS.GROQ:
        return this.makeOpenAIRequest(messages, { temperature, maxTokens, stream })
      
      case AI_PROVIDERS.ANTHROPIC:
        return this.makeAnthropicRequest(messages, { temperature, maxTokens })
      
      case AI_PROVIDERS.OLLAMA:
        return this.makeOllamaRequest(messages, { temperature, maxTokens })
      
      default:
        throw new Error(`Provedor não suportado: ${this.provider}`)
    }
  }

  private async makeOpenAIRequest(messages: AIMessage[], options: any): Promise<AIResponse> {
    const response = await axios.post(
      `${this.baseURL}/chat/completions`,
      {
        model: this.model,
        messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        stream: options.stream
      },
      { headers: this.getHeaders() }
    )

    return {
      content: response.data.choices[0].message.content,
      provider: this.provider,
      model: this.model,
      usage: response.data.usage
    }
  }

  private async makeAnthropicRequest(messages: AIMessage[], options: any): Promise<AIResponse> {
    // Converter formato para Anthropic
    const systemMessage = messages.find(m => m.role === 'system')
    const conversationMessages = messages.filter(m => m.role !== 'system')

    const response = await axios.post(
      `${this.baseURL}/messages`,
      {
        model: this.model,
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        system: systemMessage?.content,
        messages: conversationMessages
      },
      { headers: this.getHeaders() }
    )

    return {
      content: response.data.content[0].text,
      provider: this.provider,
      model: this.model,
      usage: response.data.usage
    }
  }

  private async makeOllamaRequest(messages: AIMessage[], options: any): Promise<AIResponse> {
    const response = await axios.post(
      `${this.baseURL}/api/chat`,
      {
        model: this.model,
        messages,
        options: {
          temperature: options.temperature,
          num_predict: options.maxTokens
        },
        stream: false
      }
    )

    return {
      content: response.data.message.content,
      provider: this.provider,
      model: this.model
    }
  }

  // Método para verificar se o serviço está configurado
  isConfigured(): boolean {
    if (this.provider === AI_PROVIDERS.OLLAMA) {
      return true // Ollama não precisa de API key
    }
    return !!this.apiKey
  }

  // Método para alterar configurações
  configure(config: {
    provider?: AIProvider
    apiKey?: string
    model?: string
    baseURL?: string
  }) {
    if (config.provider) this.provider = config.provider
    if (config.apiKey) this.apiKey = config.apiKey
    if (config.model) this.model = config.model
    if (config.baseURL) this.baseURL = config.baseURL
  }

  // Método para obter configurações atuais
  getConfig() {
    return {
      provider: this.provider,
      model: this.model,
      baseURL: this.baseURL,
      isConfigured: this.isConfigured()
    }
  }
}

// Instância singleton
export const aiService = new AIService()

// Prompts pré-definidos para diferentes contextos
export const AI_PROMPTS = {
  ASSISTANT: `Você é um assistente inteligente integrado ao WhatsClone, um aplicativo de mensagens. 
Seja útil, amigável e conciso em suas respostas. Responda em português brasileiro.
Você pode ajudar com:
- Responder perguntas gerais
- Dar sugestões e conselhos
- Explicar conceitos
- Ajudar com tarefas do dia a dia
- Conversar de forma natural

Mantenha suas respostas relevantes e apropriadas para um chat de mensagens.`,

  TRANSLATOR: `Você é um tradutor especializado. Detecte automaticamente o idioma do texto fornecido e traduza para português brasileiro. 
Se o texto já estiver em português, traduza para inglês. 
Forneça apenas a tradução, sem explicações adicionais.`,

  SUMMARIZER: `Você é um especialista em resumos. Analise o texto fornecido e crie um resumo conciso e informativo em português brasileiro.
Mantenha os pontos principais e informações essenciais.`,

  CREATIVE: `Você é um assistente criativo. Ajude com escrita criativa, brainstorming, ideias inovadoras e soluções criativas.
Seja imaginativo e inspirador em suas respostas.`
}

export { AI_PROVIDERS, type AIProvider, type AIMessage, type AIResponse }
