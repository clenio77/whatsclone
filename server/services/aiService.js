const axios = require('axios');

class AIService {
  constructor() {
    this.providers = {
      openai: {
        baseURL: 'https://api.openai.com/v1',
        defaultModel: 'gpt-3.5-turbo'
      },
      anthropic: {
        baseURL: 'https://api.anthropic.com/v1',
        defaultModel: 'claude-3-haiku-20240307'
      },
      groq: {
        baseURL: 'https://api.groq.com/openai/v1',
        defaultModel: 'llama3-8b-8192'
      },
      ollama: {
        baseURL: process.env.OLLAMA_URL || 'http://localhost:11434',
        defaultModel: 'llama3'
      }
    };
  }

  async chat(messages, options = {}) {
    const {
      provider = 'groq',
      model,
      temperature = 0.7,
      maxTokens = 1000,
      topP = 1,
      frequencyPenalty = 0,
      presencePenalty = 0
    } = options;

    const providerConfig = this.providers[provider];
    if (!providerConfig) {
      throw new Error(`Provedor não suportado: ${provider}`);
    }

    const selectedModel = model || providerConfig.defaultModel;

    try {
      switch (provider) {
        case 'openai':
        case 'groq':
          return await this.chatOpenAIFormat(provider, messages, {
            model: selectedModel,
            temperature,
            maxTokens,
            topP,
            frequencyPenalty,
            presencePenalty
          });

        case 'anthropic':
          return await this.chatAnthropic(messages, {
            model: selectedModel,
            temperature,
            maxTokens
          });

        case 'ollama':
          return await this.chatOllama(messages, {
            model: selectedModel,
            temperature,
            maxTokens
          });

        default:
          throw new Error(`Provedor não implementado: ${provider}`);
      }
    } catch (error) {
      console.error(`Erro na comunicação com ${provider}:`, error.message);
      throw new Error(`Falha ao comunicar com ${provider}: ${error.message}`);
    }
  }

  async chatOpenAIFormat(provider, messages, options) {
    const providerConfig = this.providers[provider];
    const apiKey = provider === 'openai' ? process.env.OPENAI_API_KEY : process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error(`API key não configurada para ${provider}`);
    }

    const response = await axios.post(
      `${providerConfig.baseURL}/chat/completions`,
      {
        model: options.model,
        messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        top_p: options.topP,
        frequency_penalty: options.frequencyPenalty,
        presence_penalty: options.presencePenalty,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return {
      content: response.data.choices[0].message.content,
      provider,
      model: options.model,
      usage: response.data.usage
    };
  }

  async chatAnthropic(messages, options) {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('API key da Anthropic não configurada');
    }

    // Converter formato para Anthropic
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await axios.post(
      `${this.providers.anthropic.baseURL}/messages`,
      {
        model: options.model,
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        system: systemMessage?.content,
        messages: conversationMessages
      },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000
      }
    );

    return {
      content: response.data.content[0].text,
      provider: 'anthropic',
      model: options.model,
      usage: response.data.usage
    };
  }

  async chatOllama(messages, options) {
    try {
      const response = await axios.post(
        `${this.providers.ollama.baseURL}/api/chat`,
        {
          model: options.model,
          messages,
          options: {
            temperature: options.temperature,
            num_predict: options.maxTokens
          },
          stream: false
        },
        {
          timeout: 60000 // Ollama pode ser mais lento
        }
      );

      return {
        content: response.data.message.content,
        provider: 'ollama',
        model: options.model
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Ollama não está rodando. Inicie o Ollama primeiro.');
      }
      throw error;
    }
  }

  // Verificar se um provedor está disponível
  async checkProvider(provider) {
    try {
      switch (provider) {
        case 'openai':
          return !!process.env.OPENAI_API_KEY;
        case 'anthropic':
          return !!process.env.ANTHROPIC_API_KEY;
        case 'groq':
          return !!process.env.GROQ_API_KEY;
        case 'ollama':
          try {
            await axios.get(`${this.providers.ollama.baseURL}/api/tags`, { timeout: 5000 });
            return true;
          } catch {
            return false;
          }
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  // Listar modelos disponíveis para um provedor
  async getAvailableModels(provider) {
    try {
      switch (provider) {
        case 'openai':
          return ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'];
        case 'anthropic':
          return ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'];
        case 'groq':
          return ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768'];
        case 'ollama':
          try {
            const response = await axios.get(`${this.providers.ollama.baseURL}/api/tags`);
            return response.data.models.map(model => model.name);
          } catch {
            return ['llama3', 'mistral', 'codellama'];
          }
        default:
          return [];
      }
    } catch (error) {
      console.error(`Erro ao listar modelos para ${provider}:`, error.message);
      return [];
    }
  }

  // Estimar custo (apenas para APIs pagas)
  estimateCost(provider, inputTokens, outputTokens) {
    const pricing = {
      'openai': {
        'gpt-3.5-turbo': { input: 0.0015, output: 0.002 }, // por 1K tokens
        'gpt-4': { input: 0.03, output: 0.06 },
        'gpt-4-turbo': { input: 0.01, output: 0.03 }
      },
      'anthropic': {
        'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
        'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
        'claude-3-opus-20240229': { input: 0.015, output: 0.075 }
      }
    };

    if (!pricing[provider]) {
      return 0; // Gratuito ou não suportado
    }

    // Implementar cálculo de custo baseado nos tokens
    return 0;
  }
}

// Instância singleton
const aiService = new AIService();

module.exports = { aiService };
