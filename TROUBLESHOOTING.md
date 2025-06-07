# 🔧 Guia de Solução de Problemas - WhatsClone

Este guia contém soluções para os problemas mais comuns ao executar o WhatsClone localmente.

## 🚨 Problemas Comuns

### 1. Erro: "MongoDB connection failed"

**Sintomas:**
```
❌ Erro ao conectar MongoDB: MongoNetworkError
```

**Soluções:**

**Linux/Mac:**
```bash
# Verificar status do MongoDB
sudo systemctl status mongod

# Iniciar MongoDB
sudo systemctl start mongod

# Habilitar inicialização automática
sudo systemctl enable mongod

# Verificar logs
tail -f /var/log/mongodb/mongod.log
```

**Windows:**
```cmd
# Iniciar serviço MongoDB
net start MongoDB

# Verificar se está rodando
tasklist | findstr mongod
```

**MongoDB Atlas:**
```bash
# Verificar string de conexão no .env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/whatsclone

# Verificar:
# 1. Usuário e senha corretos
# 2. IP na whitelist (0.0.0.0/0 para desenvolvimento)
# 3. Cluster ativo
```

### 2. Erro: "Port already in use"

**Sintomas:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Soluções:**

**Linux/Mac:**
```bash
# Encontrar processo usando a porta
lsof -i :5000
sudo lsof -i :3000

# Matar processo específico
kill -9 <PID>

# Matar todos os processos Node.js
pkill -f node
```

**Windows:**
```cmd
# Encontrar processo usando a porta
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Matar processo específico
taskkill /PID <PID> /F

# Matar todos os processos Node.js
taskkill /IM node.exe /F
```

**Alternativa - Usar portas diferentes:**
```env
# No arquivo .env
PORT=5001
VITE_PORT=3001
```

### 3. Erro: "Cannot resolve module" ou "Module not found"

**Sintomas:**
```
Error: Cannot resolve module '@/components/...'
Module not found: Can't resolve 'react'
```

**Soluções:**
```bash
# Limpar cache e reinstalar tudo
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json
rm -rf server/node_modules server/package-lock.json

# Reinstalar
npm run install:all

# Ou manualmente
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Limpar cache do npm
npm cache clean --force
```

### 4. Erro: "JWT_SECRET not defined"

**Sintomas:**
```
❌ JWT_SECRET deve ser configurado em produção
Token inválido
```

**Soluções:**
```bash
# Verificar se .env existe
ls -la .env

# Verificar conteúdo do .env
cat .env | grep JWT

# Gerar JWT secrets seguros
openssl rand -base64 32

# Adicionar ao .env
JWT_SECRET=sua-chave-gerada-aqui
JWT_REFRESH_SECRET=outra-chave-gerada-aqui
```

### 5. Erro: "Twilio credentials not found"

**Sintomas:**
```
⚠️ Twilio não configurado - SMS será simulado
❌ Erro ao enviar SMS
```

**Soluções:**

**Para desenvolvimento (SMS simulado):**
- SMS será simulado automaticamente
- Código aparecerá no console do backend
- Use qualquer código de 4 dígitos para testar

**Para SMS real:**
```env
# Configurar no .env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

### 6. Erro: "CORS policy" no navegador

**Sintomas:**
```
Access to fetch at 'http://localhost:5000' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Soluções:**
```env
# Verificar CORS_ORIGIN no .env
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Reiniciar o backend após alterar
```

### 7. Erro: "Permission denied" no Linux/Mac

**Sintomas:**
```bash
./setup.sh: Permission denied
```

**Soluções:**
```bash
# Dar permissão de execução
chmod +x setup.sh
chmod +x start.sh

# Executar
./setup.sh
```

### 8. Frontend não carrega ou tela branca

**Sintomas:**
- Página em branco
- Console com erros JavaScript
- Componentes não renderizam

**Soluções:**
```bash
# Verificar se Vite está rodando
cd client
npm run dev

# Verificar console do navegador (F12)
# Verificar se API está respondendo
curl http://localhost:5000/api/health

# Limpar cache do navegador
# Ctrl+Shift+R (hard refresh)

# Verificar variáveis de ambiente do frontend
cat client/.env.local
```

### 9. Erro: "Cannot read properties of undefined"

**Sintomas:**
```
TypeError: Cannot read properties of undefined (reading 'user')
```

**Soluções:**
```bash
# Limpar localStorage do navegador
# F12 > Application > Storage > Local Storage > Clear All

# Verificar se backend está retornando dados corretos
curl http://localhost:5000/api/health

# Reiniciar aplicação
npm run dev
```

### 10. Erro de TypeScript

**Sintomas:**
```
Type 'string' is not assignable to type 'User'
Property 'id' does not exist on type 'unknown'
```

**Soluções:**
```bash
# Verificar tipos
cd client
npm run type-check

# Reinstalar dependências TypeScript
npm install typescript @types/node @types/react

# Verificar tsconfig.json
```

## 🔍 Comandos de Diagnóstico

### Verificar Status Geral
```bash
# Verificar se tudo está rodando
curl http://localhost:5000/api/health
curl http://localhost:3000

# Verificar processos Node.js
ps aux | grep node

# Verificar portas em uso
netstat -tulpn | grep :5000
netstat -tulpn | grep :3000
```

### Verificar Logs
```bash
# Logs do backend (se usando PM2 ou similar)
tail -f logs/backend.log

# Logs do MongoDB
tail -f /var/log/mongodb/mongod.log

# Logs do sistema
journalctl -u mongod -f
```

### Verificar Configuração
```bash
# Verificar variáveis de ambiente
env | grep MONGO
env | grep JWT
env | grep TWILIO

# Verificar arquivo .env
cat .env

# Verificar package.json
cat package.json | grep scripts
```

## 🆘 Quando Nada Funciona

### Reset Completo
```bash
# 1. Parar todos os processos
pkill -f node
sudo systemctl stop mongod

# 2. Limpar tudo
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json
rm -rf server/node_modules server/package-lock.json
rm -rf .env

# 3. Reconfigurar
cp .env.example .env
# Editar .env com configurações corretas

# 4. Reinstalar
npm run install:all

# 5. Reiniciar MongoDB
sudo systemctl start mongod

# 6. Executar
npm run dev
```

### Verificar Requisitos Mínimos
```bash
# Node.js versão 18+
node --version

# npm versão 8+
npm --version

# Espaço em disco (pelo menos 1GB livre)
df -h

# Memória RAM (pelo menos 2GB disponível)
free -h
```

## 📞 Obtendo Ajuda

### Logs Úteis para Reportar Problemas
```bash
# Coletar informações do sistema
echo "=== Sistema ===" > debug.log
uname -a >> debug.log
node --version >> debug.log
npm --version >> debug.log

echo "=== Processos ===" >> debug.log
ps aux | grep node >> debug.log

echo "=== Portas ===" >> debug.log
netstat -tulpn | grep -E ":(3000|5000)" >> debug.log

echo "=== MongoDB ===" >> debug.log
systemctl status mongod >> debug.log

echo "=== Logs Backend ===" >> debug.log
tail -50 server/logs/error.log >> debug.log 2>/dev/null || echo "No backend logs" >> debug.log

# Enviar debug.log ao reportar problemas
```

### Informações Importantes para Suporte
1. Sistema operacional e versão
2. Versão do Node.js e npm
3. Mensagem de erro completa
4. Passos que levaram ao erro
5. Conteúdo do arquivo .env (sem dados sensíveis)
6. Logs relevantes

## ✅ Verificação Final

Se tudo estiver funcionando, você deve ver:

1. **Backend**: http://localhost:5000 retorna página de boas-vindas
2. **Health Check**: http://localhost:5000/api/health retorna `{"status":"OK"}`
3. **Frontend**: http://localhost:3000 mostra tela de login
4. **MongoDB**: Conectado sem erros
5. **Console**: Sem erros críticos

**🎉 Se todos os pontos estão funcionando, o WhatsClone está pronto para uso!**
