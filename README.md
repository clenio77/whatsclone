# WhatsClone Web

Um clone moderno do WhatsApp desenvolvido com tecnologias web atuais para fins de aprendizado.

## 🚀 Tecnologias

### Frontend
- **React.js** com TypeScript
- **Vite** - Build tool moderno
- **Tailwind CSS** - Framework CSS utilitário
- **Socket.io-client** - Comunicação em tempo real
- **React Router** - Roteamento
- **Zustand** - Gerenciamento de estado

### Backend
- **Node.js** com Express.js
- **Socket.io** - WebSocket para tempo real
- **MongoDB** com Mongoose - Banco de dados
- **JWT** - Autenticação
- **Twilio** - Envio de SMS
- **Bcrypt** - Hash de senhas

## 📁 Estrutura do Projeto

```
whatsclone-web/
├── client/                 # Frontend React
│   ├── public/            # Arquivos públicos
│   └── src/
│       ├── components/    # Componentes reutilizáveis
│       │   ├── auth/      # Componentes de autenticação
│       │   ├── chat/      # Componentes do chat
│       │   ├── common/    # Componentes comuns
│       │   └── contacts/  # Componentes de contatos
│       ├── pages/         # Páginas principais
│       │   ├── Login/     # Página de login
│       │   ├── Chat/      # Página principal do chat
│       │   └── Profile/   # Página de perfil
│       ├── hooks/         # Custom hooks React
│       ├── services/      # Chamadas para API
│       ├── utils/         # Funções utilitárias
│       ├── styles/        # Estilos globais
│       └── assets/        # Imagens, ícones, etc.
├── server/                # Backend Node.js
│   ├── controllers/       # Lógica de negócio
│   ├── models/           # Modelos do MongoDB
│   ├── routes/           # Rotas da API REST
│   ├── middleware/       # Middlewares Express
│   ├── socket/           # Lógica do Socket.io
│   ├── config/           # Configurações
│   └── utils/            # Utilitários do servidor
└── shared/               # Código compartilhado
    ├── types/            # Tipos TypeScript
    ├── constants/        # Constantes
    └── utils/            # Utilitários compartilhados
```

## 🎯 Funcionalidades

### ✅ Implementadas

#### Backend
- ✅ **Sistema de Autenticação Completo**
  - Registro de usuários
  - Verificação por SMS (Twilio)
  - Login com JWT
  - Refresh tokens
  - Middleware de autenticação

- ✅ **API REST Completa**
  - CRUD de usuários
  - CRUD de chats
  - CRUD de mensagens
  - Validação de dados
  - Tratamento de erros

- ✅ **Socket.io para Tempo Real**
  - Conexão autenticada
  - Salas de chat
  - Envio/recebimento de mensagens
  - Status de leitura/entrega
  - Indicadores de digitação
  - Status online/offline

- ✅ **Segurança e Performance**
  - Helmet para headers seguros
  - CORS configurado
  - Rate limiting
  - Hash de senhas
  - Validação de dados

#### Frontend
- ✅ **Interface Moderna**
  - Design responsivo
  - Tema claro/escuro
  - Componentes reutilizáveis
  - Animações suaves

- ✅ **Autenticação Completa**
  - Tela de login/registro
  - Verificação por SMS
  - Persistência de sessão
  - Rotas protegidas

- ✅ **Gerenciamento de Estado**
  - Zustand para estado global
  - Persistência local
  - Sincronização automática

- ✅ **Chat em Tempo Real Funcional**
  - Envio/recebimento de mensagens
  - Lista de conversas dinâmica
  - Busca de usuários
  - Indicadores de digitação
  - Status online/offline

- ✅ **Assistente IA Integrado**
  - Múltiplos provedores (OpenAI, Anthropic, Groq, Ollama)
  - 4 modos especializados
  - Interface dedicada
  - Envio para chat

- ✅ **Sistema de Administração**
  - Dashboard com métricas
  - Gerenciamento de usuários
  - Controle de permissões
  - Monitoramento de segurança

- ✅ **Segurança Avançada**
  - Blacklist de tokens JWT
  - Rate limiting por endpoint
  - Logs de segurança
  - Proteção contra ataques

### 🚧 Em Desenvolvimento
- [ ] Criação de grupos
- [ ] Upload de arquivos/imagens
- [ ] Notificações push
- [ ] PWA completo

## 🛠️ Instalação e Execução

### 🐳 Opção 1: Docker (Recomendado - Mais Fácil)
```bash
# Setup rápido com Docker
git clone https://github.com/clenio77/whatsclone
cd whatsclone
./docker-dev.sh start        # Linux/Mac
# ou docker-dev.bat start     # Windows

# Criar usuário admin
./docker-dev.sh admin
```
**Vantagens**: Zero configuração, ambiente isolado, inclui banco de dados

### 🔧 Opção 2: Instalação Local
#### Pré-requisitos
- Node.js (v18+)
- MongoDB (local ou Atlas)
- Conta Twilio (para SMS - opcional)

### 1. Configuração Inicial
```bash
# Clonar o repositório
git clone https://github.com/clenio77/whatsclone
cd whatsclone/whatsclone-web

# Instalar dependências do workspace
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações
```

### 2. Backend
```bash
cd server
npm install
npm run dev
```

### 3. Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Execução Completa
```bash
# Na raiz do projeto whatsclone-web
npm run dev
# Isso iniciará backend e frontend simultaneamente
```

### 5. Acessar Aplicação
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 👨‍💼 Sistema de Administração

O WhatsClone inclui um painel administrativo completo para gerenciar usuários e monitorar o sistema.

### Criar Usuário Administrador
```bash
cd server
npm run create-admin
```

**Credenciais padrão:**
- **Email**: admin@whatsclone.com
- **Senha**: admin123456
- **⚠️ IMPORTANTE**: Altere a senha após o primeiro login!

### Acessar Painel Admin
1. Faça login com as credenciais de admin
2. Clique no ícone 🛡️ (Shield) no chat
3. Acesse `/admin` para o dashboard

### Funcionalidades Administrativas
- 📊 **Dashboard** - Métricas em tempo real
- 👥 **Gerenciar Usuários** - CRUD completo
- 🔍 **Busca Avançada** - Filtros por status e role
- 🛡️ **Controle de Sessões** - Revogar acessos
- 📈 **Estatísticas** - Crescimento e atividade
- 🔒 **Monitoramento** - Eventos de segurança

### Documentação Completa
Veja `ADMIN_GUIDE.md` para instruções detalhadas de administração.

## 🐳 Ambiente Virtual

Para testar o projeto em um ambiente isolado, consulte:
- **`VIRTUAL_ENVIRONMENT.md`** - Guia completo de ambientes virtuais
- **`QUICK_START.md`** - Início rápido para testes

### Opções Disponíveis:
- 🐳 **Docker** - Recomendado (mais fácil)
- 🔧 **Local** - Node.js + MongoDB
- ☁️ **Cloud** - Codespaces/Gitpod

## 📝 Próximos Passos

1. **Setup inicial** - Configurar package.json e dependências
2. **Backend base** - API REST e Socket.io
3. **Frontend base** - React com Vite
4. **Autenticação** - Sistema de login completo
5. **Chat em tempo real** - Implementar mensagens
6. **Interface moderna** - Design e UX

## 🤝 Contribuição

Este é um projeto de aprendizado. Sinta-se livre para contribuir com melhorias!

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.
