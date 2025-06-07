# Estrutura Detalhada do Projeto WhatsClone Web

## 📂 Organização dos Diretórios

### `/client` - Frontend React + TypeScript

#### `/client/public`
- Arquivos estáticos servidos diretamente
- `index.html`, `favicon.ico`, `manifest.json`

#### `/client/src/components`
Componentes React organizados por funcionalidade:

- **`/auth`** - Componentes de autenticação
  - `LoginForm.tsx` - Formulário de login
  - `PhoneVerification.tsx` - Verificação por SMS
  - `AuthGuard.tsx` - Proteção de rotas

- **`/chat`** - Componentes do sistema de chat
  - `ChatWindow.tsx` - Janela principal do chat
  - `MessageList.tsx` - Lista de mensagens
  - `MessageInput.tsx` - Input para nova mensagem
  - `MessageBubble.tsx` - Bolha individual de mensagem
  - `TypingIndicator.tsx` - Indicador de digitação

- **`/common`** - Componentes reutilizáveis
  - `Button.tsx` - Botão customizado
  - `Input.tsx` - Input customizado
  - `Modal.tsx` - Modal genérico
  - `Loading.tsx` - Componente de loading
  - `Avatar.tsx` - Avatar do usuário

- **`/contacts`** - Componentes de contatos
  - `ContactList.tsx` - Lista de contatos
  - `ContactItem.tsx` - Item individual de contato
  - `ContactSearch.tsx` - Busca de contatos

#### `/client/src/pages`
Páginas principais da aplicação:

- **`/Login`** - Página de autenticação
  - `index.tsx` - Componente principal
  - `Login.module.css` - Estilos específicos

- **`/Chat`** - Página principal do chat
  - `index.tsx` - Layout principal
  - `Sidebar.tsx` - Barra lateral com conversas
  - `ChatArea.tsx` - Área do chat ativo

- **`/Profile`** - Página de perfil do usuário
  - `index.tsx` - Configurações do usuário

#### `/client/src/hooks`
Custom hooks React:
- `useAuth.ts` - Hook de autenticação
- `useSocket.ts` - Hook para Socket.io
- `useChat.ts` - Hook para funcionalidades de chat
- `useLocalStorage.ts` - Hook para localStorage

#### `/client/src/services`
Serviços para comunicação com APIs:
- `api.ts` - Configuração base do Axios
- `authService.ts` - Serviços de autenticação
- `chatService.ts` - Serviços de chat
- `socketService.ts` - Configuração do Socket.io

#### `/client/src/utils`
Funções utilitárias:
- `formatters.ts` - Formatação de dados
- `validators.ts` - Validações
- `constants.ts` - Constantes do frontend
- `helpers.ts` - Funções auxiliares

### `/server` - Backend Node.js + Express

#### `/server/controllers`
Controladores da API REST:
- `authController.js` - Autenticação e registro
- `userController.js` - Gerenciamento de usuários
- `chatController.js` - Operações de chat
- `messageController.js` - Gerenciamento de mensagens

#### `/server/models`
Modelos do MongoDB (Mongoose):
- `User.js` - Modelo do usuário
- `Chat.js` - Modelo da conversa
- `Message.js` - Modelo da mensagem
- `Contact.js` - Modelo de contato

#### `/server/routes`
Rotas da API REST:
- `auth.js` - Rotas de autenticação
- `users.js` - Rotas de usuários
- `chats.js` - Rotas de chat
- `messages.js` - Rotas de mensagens

#### `/server/middleware`
Middlewares Express:
- `auth.js` - Middleware de autenticação JWT
- `validation.js` - Validação de dados
- `errorHandler.js` - Tratamento de erros
- `rateLimiter.js` - Limitação de requisições

#### `/server/socket`
Lógica do Socket.io:
- `socketHandler.js` - Configuração principal
- `chatEvents.js` - Eventos de chat
- `userEvents.js` - Eventos de usuário
- `messageEvents.js` - Eventos de mensagem

#### `/server/config`
Configurações do servidor:
- `database.js` - Configuração MongoDB
- `jwt.js` - Configuração JWT
- `twilio.js` - Configuração Twilio
- `environment.js` - Variáveis de ambiente

### `/shared` - Código Compartilhado

#### `/shared/types`
Tipos TypeScript compartilhados:
- `User.ts` - Tipos do usuário
- `Message.ts` - Tipos de mensagem
- `Chat.ts` - Tipos de chat
- `API.ts` - Tipos das APIs

#### `/shared/constants`
Constantes compartilhadas:
- `events.ts` - Eventos do Socket.io
- `status.ts` - Status de mensagens
- `errors.ts` - Códigos de erro

#### `/shared/utils`
Utilitários compartilhados:
- `validation.ts` - Validações comuns
- `formatters.ts` - Formatadores comuns
- `helpers.ts` - Funções auxiliares

## 🔄 Fluxo de Dados

```
Frontend (React) ←→ Backend (Express API) ←→ MongoDB
       ↓                    ↓
   Socket.io Client ←→ Socket.io Server
```

## 🎯 Próximas Etapas

1. **Configurar package.json** para client e server
2. **Instalar dependências** necessárias
3. **Configurar Vite** para o frontend
4. **Configurar Express** para o backend
5. **Implementar modelos** do MongoDB
6. **Criar sistema de autenticação**
7. **Implementar Socket.io** para tempo real
8. **Desenvolver interface** do usuário

## 📋 Checklist de Desenvolvimento

### Backend
- [ ] Configuração inicial do Express
- [ ] Conexão com MongoDB
- [ ] Modelos de dados
- [ ] Rotas de autenticação
- [ ] Middleware JWT
- [ ] Socket.io setup
- [ ] Integração Twilio

### Frontend
- [ ] Configuração Vite + React
- [ ] Configuração Tailwind CSS
- [ ] Componentes base
- [ ] Sistema de roteamento
- [ ] Integração com API
- [ ] Socket.io client
- [ ] Interface responsiva

### Integração
- [ ] Autenticação end-to-end
- [ ] Chat em tempo real
- [ ] Testes de funcionalidade
- [ ] Deploy e configuração
