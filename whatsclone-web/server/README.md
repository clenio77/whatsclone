# WhatsClone Server

Backend do WhatsClone desenvolvido com Node.js, Express.js, MongoDB e Socket.io.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **Socket.io** - Comunicação em tempo real
- **JWT** - Autenticação
- **Twilio** - Envio de SMS
- **Bcrypt** - Hash de senhas

## 📁 Estrutura

```
server/
├── config/           # Configurações
│   ├── database.js   # Conexão MongoDB
│   ├── jwt.js        # Configuração JWT
│   ├── twilio.js     # Configuração Twilio
│   └── environment.js # Variáveis de ambiente
├── controllers/      # Lógica de negócio
│   ├── authController.js
│   ├── userController.js
│   ├── chatController.js
│   └── messageController.js
├── models/          # Modelos MongoDB
│   ├── User.js
│   ├── Chat.js
│   └── Message.js
├── routes/          # Rotas da API
│   ├── auth.js
│   ├── users.js
│   ├── chats.js
│   └── messages.js
├── middleware/      # Middlewares
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
├── socket/          # Socket.io
│   └── socketHandler.js
├── utils/           # Utilitários
│   ├── jwt.js
│   └── sms.js
└── server.js        # Arquivo principal
```

## 🛠️ Instalação

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   ```bash
   cp ../.env.example .env
   # Editar .env com suas configurações
   ```

3. **Iniciar MongoDB** (local ou usar MongoDB Atlas)

4. **Executar em desenvolvimento**:
   ```bash
   npm run dev
   ```

## 🔧 Configuração

### Variáveis de Ambiente Obrigatórias

```env
# Banco de dados
MONGODB_URI=mongodb://localhost:27017/whatsclone

# JWT
JWT_SECRET=sua-chave-secreta-aqui
JWT_REFRESH_SECRET=sua-chave-refresh-aqui

# Twilio (para SMS)
TWILIO_ACCOUNT_SID=seu-account-sid
TWILIO_AUTH_TOKEN=seu-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Configurações Opcionais

```env
# Servidor
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/send-verification` - Enviar código SMS
- `POST /api/auth/verify` - Verificar código e fazer login
- `POST /api/auth/login` - Login direto (usuários verificados)
- `POST /api/auth/refresh` - Renovar token

### Usuários
- `GET /api/users/profile` - Obter perfil
- `PUT /api/users/profile` - Atualizar perfil
- `GET /api/users/search` - Buscar usuários
- `PUT /api/users/online-status` - Atualizar status online

### Chats
- `GET /api/chats` - Listar chats do usuário
- `POST /api/chats` - Criar novo chat
- `GET /api/chats/:id` - Obter chat específico
- `PUT /api/chats/:id/read` - Marcar como lido

### Mensagens
- `GET /api/messages/:chatId` - Obter mensagens do chat
- `POST /api/messages` - Enviar mensagem
- `PUT /api/messages/:id` - Editar mensagem
- `DELETE /api/messages/:id` - Deletar mensagem

## 🔌 Socket.io Events

### Cliente → Servidor
- `join_chat` - Entrar em chat
- `leave_chat` - Sair do chat
- `send_message` - Enviar mensagem
- `mark_as_read` - Marcar como lida
- `typing_start` - Iniciar digitação
- `typing_stop` - Parar digitação

### Servidor → Cliente
- `new_message` - Nova mensagem
- `message_read` - Mensagem lida
- `user_typing` - Usuário digitando
- `user_online` - Status online/offline
- `error` - Erro

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch
```

## 📊 Monitoramento

### Health Check
```bash
GET /api/health
```

Retorna:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

### Logs
- Logs de desenvolvimento: console
- Logs de produção: configurar serviço externo

## 🔒 Segurança

- **Helmet** - Headers de segurança
- **CORS** - Controle de origem
- **Rate Limiting** - Limite de requisições
- **JWT** - Autenticação stateless
- **Bcrypt** - Hash de senhas
- **Validação** - Sanitização de dados

## 🚀 Deploy

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

### Docker (futuro)
```bash
docker build -t whatsclone-server .
docker run -p 5000:5000 whatsclone-server
```

## 📝 TODO

- [ ] Upload de arquivos/imagens
- [ ] Notificações push
- [ ] Grupos avançados
- [ ] Backup automático
- [ ] Métricas e analytics
- [ ] Testes automatizados
- [ ] Docker e CI/CD
