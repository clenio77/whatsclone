# 🚀 Guia de Configuração Local - WhatsClone

Este guia contém todos os passos necessários para executar o WhatsClone localmente em sua máquina.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

### Obrigatórios
- **Node.js** (versão 18 ou superior)
  - Download: https://nodejs.org/
  - Verificar: `node --version`
- **npm** (vem com Node.js)
  - Verificar: `npm --version`
- **Git**
  - Download: https://git-scm.com/
  - Verificar: `git --version`

### Banco de Dados (escolha uma opção)
**Opção 1: MongoDB Local**
- Download: https://www.mongodb.com/try/download/community
- Instalar e iniciar o serviço

**Opção 2: MongoDB Atlas (Recomendado)**
- Criar conta gratuita: https://www.mongodb.com/atlas
- Criar cluster gratuito
- Obter string de conexão

### SMS (Opcional para desenvolvimento)
- **Conta Twilio** (para envio de SMS real)
  - Criar conta: https://www.twilio.com/
  - Obter Account SID, Auth Token e número de telefone

## 🔧 Passo a Passo

### 1. Clonar o Repositório

```bash
# Clonar o projeto
git clone https://github.com/clenio77/whatsclone.git

# Entrar no diretório
cd whatsclone

# Verificar se está na branch correta
git branch
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env
nano .env
# ou
code .env
```

**Configuração mínima do .env:**
```env
# Banco de dados
MONGODB_URI=mongodb://localhost:27017/whatsclone
# ou para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/whatsclone

# JWT (gerar chaves seguras)
JWT_SECRET=sua-chave-super-secreta-aqui-min-32-chars
JWT_REFRESH_SECRET=sua-chave-refresh-super-secreta-aqui

# Servidor
PORT=5000
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Twilio (opcional - SMS será simulado se não configurado)
TWILIO_ACCOUNT_SID=seu-account-sid
TWILIO_AUTH_TOKEN=seu-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Instalar Dependências

```bash
# Instalar dependências de todos os projetos
npm run install:all

# Ou instalar manualmente:
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 4. Configurar Banco de Dados

**Se usando MongoDB local:**
```bash
# Iniciar MongoDB (Linux/Mac)
sudo systemctl start mongod
# ou
brew services start mongodb/brew/mongodb-community

# Verificar se está rodando
mongo --eval "db.adminCommand('ismaster')"
```

**Se usando MongoDB Atlas:**
- Criar cluster no MongoDB Atlas
- Adicionar seu IP à whitelist
- Criar usuário de banco de dados
- Copiar string de conexão para o .env

### 5. Executar o Projeto

**Opção 1: Executar tudo junto (Recomendado)**
```bash
# Executar backend e frontend simultaneamente
npm run dev
```

**Opção 2: Executar separadamente**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 6. Verificar se está Funcionando

**Backend:**
- Abrir: http://localhost:5000
- Health check: http://localhost:5000/api/health
- Deve mostrar: `{"status":"OK",...}`

**Frontend:**
- Abrir: http://localhost:3000
- Deve mostrar a tela de login do WhatsClone

**Logs esperados:**
```
Backend:
✅ Ambiente configurado: development
🍃 MongoDB conectado: localhost:27017
🚀 Servidor rodando na porta 5000

Frontend:
Local:   http://localhost:3000/
Network: use --host to expose
```

## 🧪 Testando as Funcionalidades

### 1. Teste de Registro
1. Abrir http://localhost:3000
2. Clicar em "Não tem uma conta? Registrar-se"
3. Preencher nome e telefone (formato: +5511999999999)
4. Clicar em "Continuar"
5. Verificar se aparece tela de verificação

### 2. Teste de SMS (Desenvolvimento)
- **Com Twilio configurado**: SMS real será enviado
- **Sem Twilio**: Código aparecerá no console do backend
- Código padrão para testes: qualquer 4 dígitos (ex: 1234)

### 3. Teste de Login
1. Após verificação, deve redirecionar para o chat
2. Verificar se aparece interface do chat
3. Testar tema claro/escuro no perfil

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
# Executar tudo
npm run dev

# Executar apenas backend
npm run dev:server

# Executar apenas frontend
npm run dev:client

# Verificar tipos TypeScript
cd client && npm run type-check

# Executar linting
npm run lint
```

### Build e Produção
```bash
# Build completo
npm run build

# Build apenas frontend
npm run build:client

# Build apenas backend
npm run build:server

# Executar em produção
npm start
```

### Testes
```bash
# Executar testes (quando implementados)
npm test

# Testes do frontend
cd client && npm test

# Testes do backend
cd server && npm test
```

### Limpeza
```bash
# Limpar node_modules e builds
npm run clean

# Reinstalar tudo
npm run clean && npm run install:all
```

## 🐛 Solução de Problemas

### Erro: "MongoDB connection failed"
```bash
# Verificar se MongoDB está rodando
sudo systemctl status mongod

# Ou verificar logs
tail -f /var/log/mongodb/mongod.log

# Reiniciar MongoDB
sudo systemctl restart mongod
```

### Erro: "Port 5000 already in use"
```bash
# Encontrar processo usando a porta
lsof -i :5000

# Matar processo
kill -9 <PID>

# Ou usar porta diferente no .env
PORT=5001
```

### Erro: "Cannot resolve module"
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json
rm -rf server/node_modules server/package-lock.json
npm run install:all
```

### Erro: "JWT_SECRET not defined"
- Verificar se arquivo .env existe na raiz
- Verificar se JWT_SECRET está definido
- Reiniciar o servidor após alterar .env

## 📱 Testando no Mobile

### Acessar de outro dispositivo na rede
1. Descobrir IP da máquina: `ip addr show` (Linux) ou `ipconfig` (Windows)
2. Atualizar .env:
   ```env
   VITE_API_URL=http://SEU_IP:5000/api
   VITE_SOCKET_URL=http://SEU_IP:5000
   ```
3. Reiniciar o projeto
4. Acessar no mobile: `http://SEU_IP:3000`

## 🔒 Configuração de Produção

Para deploy em produção, alterar:
```env
NODE_ENV=production
JWT_SECRET=chave-super-segura-de-producao
MONGODB_URI=sua-string-de-producao
CORS_ORIGIN=https://seu-dominio.com
```

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs do console
2. Verificar se todas as dependências estão instaladas
3. Verificar se MongoDB está rodando
4. Verificar se as portas não estão em uso
5. Consultar documentação nos READMEs específicos

## ✅ Checklist de Verificação

- [ ] Node.js 18+ instalado
- [ ] MongoDB rodando (local ou Atlas)
- [ ] Arquivo .env configurado
- [ ] Dependências instaladas (`npm run install:all`)
- [ ] Backend rodando (http://localhost:5000)
- [ ] Frontend rodando (http://localhost:3000)
- [ ] Health check funcionando
- [ ] Tela de login carregando
- [ ] Registro de usuário funcionando
- [ ] Verificação SMS funcionando (simulada ou real)

**🎉 Se todos os itens estão marcados, o WhatsClone está funcionando perfeitamente!**
