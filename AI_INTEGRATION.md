# 🤖 Integração com Agentes IA - WhatsClone

O WhatsClone agora inclui um sistema completo de integração com agentes de IA (LLM) que permite conversas inteligentes diretamente no chat.

## 🎯 Funcionalidades Implementadas

### ✅ **Assistente IA Integrado**
- **Interface moderna** - Modal dedicado para interação com IA
- **Múltiplos modos** - Assistente geral, tradutor, resumidor, criativo
- **Envio para chat** - Respostas da IA podem ser enviadas diretamente para conversas
- **Histórico de conversa** - Mantém contexto durante a sessão

### ✅ **Suporte a Múltiplos Provedores**
- **OpenAI** - GPT-3.5, GPT-4, GPT-4 Turbo
- **Anthropic** - Claude 3 (Haiku, Sonnet, Opus)
- **Groq** - LLaMA 3, Mixtral (Gratuito e rápido)
- **Ollama** - Modelos locais (Privacidade total)

### ✅ **Backend Completo**
- **API REST** - Endpoints para chat com IA
- **Configuração flexível** - Suporte a diferentes provedores
- **Bots personalizados** - Criação de assistentes especializados
- **Gerenciamento de uso** - Tracking e analytics

## 🚀 Como Usar

### **1. Configurar Provedor de IA**

Escolha um provedor e configure no arquivo `.env`:

#### **Groq (Recomendado - Gratuito)**
```env
DEFAULT_AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_groq_api_key_here
VITE_AI_PROVIDER=groq
VITE_AI_API_KEY=gsk_your_groq_api_key_here
```

#### **OpenAI**
```env
DEFAULT_AI_PROVIDER=openai
OPENAI_API_KEY=sk-your_openai_api_key_here
VITE_AI_PROVIDER=openai
VITE_AI_API_KEY=sk-your_openai_api_key_here
```

#### **Anthropic (Claude)**
```env
DEFAULT_AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here
VITE_AI_PROVIDER=anthropic
VITE_AI_API_KEY=sk-ant-your_anthropic_key_here
```

#### **Ollama (Local)**
```env
DEFAULT_AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
VITE_AI_PROVIDER=ollama
VITE_OLLAMA_URL=http://localhost:11434
```

### **2. Obter API Keys**

#### **Groq (Gratuito e Rápido)**
1. Acesse: https://console.groq.com/
2. Crie uma conta gratuita
3. Gere uma API key
4. Limite: 6.000 tokens/minuto gratuito

#### **OpenAI**
1. Acesse: https://platform.openai.com/
2. Crie uma conta
3. Adicione créditos ($5 mínimo)
4. Gere uma API key

#### **Anthropic**
1. Acesse: https://console.anthropic.com/
2. Crie uma conta
3. Adicione créditos
4. Gere uma API key

#### **Ollama (Local)**
1. Instale: https://ollama.ai/
2. Execute: `ollama pull llama3`
3. Inicie: `ollama serve`

### **3. Usar no WhatsClone**

1. **Abrir assistente**: Clique no ícone 🤖 na interface do chat
2. **Escolher modo**: Assistente, Tradutor, Resumidor ou Criativo
3. **Conversar**: Digite sua pergunta e pressione Enter
4. **Enviar para chat**: Clique em "Enviar para chat" nas respostas da IA

## 🎨 Modos de IA Disponíveis

### **1. Assistente Geral**
- Conversas naturais
- Resposta a perguntas
- Ajuda com tarefas
- Conselhos e sugestões

### **2. Tradutor**
- Detecção automática de idioma
- Tradução para português/inglês
- Suporte a múltiplos idiomas

### **3. Resumidor**
- Resumos de textos longos
- Extração de pontos principais
- Síntese de informações

### **4. Criativo**
- Escrita criativa
- Brainstorming
- Geração de ideias
- Soluções inovadoras

## 🔧 API Endpoints

### **Chat com IA**
```http
POST /api/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "messages": [
    {"role": "system", "content": "Você é um assistente útil"},
    {"role": "user", "content": "Olá, como você pode me ajudar?"}
  ],
  "provider": "groq",
  "model": "llama3-8b-8192",
  "temperature": 0.7,
  "maxTokens": 1000
}
```

### **Configuração da IA**
```http
GET /api/ai/config
Authorization: Bearer <token>
```

### **Provedores Disponíveis**
```http
GET /api/ai/providers
Authorization: Bearer <token>
```

## 💰 Custos e Limites

### **Gratuitos**
- **Groq**: 6.000 tokens/minuto
- **Ollama**: Ilimitado (local)

### **Pagos**
- **OpenAI GPT-3.5**: $0.0015/1K tokens input
- **OpenAI GPT-4**: $0.03/1K tokens input
- **Claude Haiku**: $0.00025/1K tokens input
- **Claude Sonnet**: $0.003/1K tokens input

## 🔒 Privacidade e Segurança

### **Dados Enviados**
- Apenas o conteúdo da conversa é enviado
- Nenhum dado pessoal ou de outros chats
- Conversas não são armazenadas nos provedores

### **Recomendações**
- **Ollama** para máxima privacidade (local)
- **Groq** para uso gratuito
- **OpenAI/Anthropic** para melhor qualidade

## 🛠️ Desenvolvimento

### **Adicionar Novo Provedor**
1. Editar `client/src/services/aiService.ts`
2. Adicionar configuração em `server/services/aiService.js`
3. Atualizar constantes em `shared/constants/index.ts`

### **Criar Bot Personalizado**
```javascript
// Exemplo de bot especializado
const bot = {
  name: "Assistente de Código",
  systemPrompt: "Você é um especialista em programação...",
  provider: "groq",
  model: "llama3-8b-8192"
}
```

## 📊 Monitoramento

### **Métricas Disponíveis**
- Número de conversas
- Tokens utilizados
- Custo estimado
- Tempo de resposta
- Provedor mais usado

### **Logs**
```bash
# Backend logs
tail -f server/logs/ai.log

# Verificar uso
curl -H "Authorization: Bearer <token>" \
     http://localhost:5000/api/ai/usage
```

## 🚀 Próximas Funcionalidades

### **Em Desenvolvimento**
- [ ] Bots especializados por contexto
- [ ] Integração com documentos
- [ ] Análise de sentimentos
- [ ] Respostas automáticas
- [ ] Treinamento personalizado

### **Futuro**
- [ ] Integração com Whisper (áudio)
- [ ] Geração de imagens (DALL-E)
- [ ] Análise de imagens (GPT-4V)
- [ ] Agentes autônomos

## 🎉 Exemplos de Uso

### **Assistente Pessoal**
- "Me ajude a planejar minha semana"
- "Resuma este artigo para mim"
- "Traduza esta mensagem para inglês"

### **Produtividade**
- "Crie um email profissional sobre..."
- "Me dê ideias para apresentação"
- "Explique este conceito técnico"

### **Criatividade**
- "Escreva uma história sobre..."
- "Crie um poema sobre..."
- "Me dê ideias para um projeto"

**🤖 O WhatsClone agora é um assistente inteligente completo!**
