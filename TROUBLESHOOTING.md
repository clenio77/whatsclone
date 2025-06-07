# 🔧 Guia de Solução de Problemas - WhatsClone

Este guia ajuda a resolver os problemas mais comuns do WhatsClone.

## 🚨 Problemas Mais Comuns

### **1. 🗄️ Erro MongoDB: "connect ECONNREFUSED 127.0.0.1:27017"**

#### **Sintomas:**
```
❌ Erro ao conectar MongoDB: MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

#### **Causa:**
MongoDB não está rodando na porta 27017.

#### **Soluções:**

##### **🔧 Solução Rápida:**
```bash
# Verificar status
npm run mongo:status

# Iniciar MongoDB
npm run mongo:start

# Testar conexão
npm run mongo:test
```

##### **🐳 Solução com Docker:**
```bash
# Iniciar MongoDB via Docker
docker run -d --name whatsclone-mongo -p 27017:27017 mongo:7.0

# Verificar se está rodando
docker ps | grep mongo
```

##### **📋 Solução Manual:**
```bash
# Ubuntu/Debian
sudo systemctl start mongod
sudo systemctl enable mongod

# macOS
brew services start mongodb-community

# Windows
net start MongoDB
```

#### **Script Automático:**
```bash
./mongodb-manager.sh start
```

---

### **2. 🎨 Erro Tailwind: "border-border class does not exist"**

#### **Sintomas:**
```
The `border-border` class does not exist
```

#### **Solução:**
```bash
# Correção automática
npm run fix:tailwind

# Ou manual
cd client
rm -rf node_modules/.vite
npm install
npm run dev
```

---

### **3. 🌐 Erro CORS: "Origem não permitida"**

#### **Sintomas:**
```
{"error":"Origem não permitida"}
```

#### **Solução:**
```bash
# Correção automática
npm run fix:registration

# Verificar arquivo .env
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

---

### **4. 📱 Erro de Registro: "Erro interno do servidor"**

#### **Sintomas:**
Registro de usuário falha com erro 500.

#### **Solução:**
```bash
# Correção completa
npm run fix:registration

# Verificar MongoDB
npm run mongo:test

# Verificar logs
tail -f server/logs/security.log
```

---

## 🛠️ Scripts de Correção Automática

### **📋 Scripts Disponíveis:**
```bash
npm run mongo:start        # Iniciar MongoDB
npm run mongo:status       # Status do MongoDB
npm run mongo:test         # Testar conexão
npm run fix:registration   # Corrigir registro
npm run fix:tailwind       # Corrigir Tailwind
npm run start:full         # Inicialização completa
```

### **🔧 Scripts Manuais:**
```bash
./mongodb-manager.sh start     # Gerenciar MongoDB
./fix-registration.sh          # Corrigir registro
./fix-tailwind.sh             # Corrigir Tailwind CSS
./start-whatsclone.sh         # Inicialização completa
```

---

## 🔍 Diagnóstico Completo

### **1. Verificar Sistema:**
```bash
# Verificar Node.js
node --version  # Deve ser 18+

# Verificar npm
npm --version   # Deve ser 8+

# Verificar Docker
docker --version

# Verificar portas
netstat -tulpn | grep -E ':(3000|5000|27017)'
```

### **2. Verificar Configuração:**
```bash
# Verificar .env
cat .env

# Verificar MongoDB
npm run mongo:status

# Verificar dependências
npm list --depth=0
```

---

## 🚨 Soluções de Emergência

### **🔄 Reset Completo:**
```bash
# Parar tudo
docker stop whatsclone-mongo
pkill -f node

# Limpar cache
rm -rf node_modules
rm -rf client/node_modules
rm -rf server/node_modules
rm -rf client/.vite

# Reinstalar
npm run install:all

# Reiniciar MongoDB
npm run mongo:start

# Iniciar aplicação
npm run start:full
```

### **🗄️ Reset MongoDB:**
```bash
# Backup primeiro (opcional)
./mongodb-manager.sh backup

# Reset completo
./mongodb-manager.sh clean

# Reiniciar
./mongodb-manager.sh start

# Recriar usuários
cd server && npm run create-test-users
```

---

## ✅ Checklist de Funcionamento

### **🎯 Verificação Básica:**
- [ ] MongoDB rodando na porta 27017
- [ ] Node.js versão 18+
- [ ] Dependências instaladas
- [ ] Arquivo .env configurado
- [ ] Portas 3000 e 5000 livres

### **🧪 Teste Funcional:**
- [ ] Registro de usuário funciona
- [ ] Login funciona
- [ ] Chat em tempo real funciona
- [ ] Painel admin acessível (se admin)

### **🔧 Comandos de Teste:**
```bash
# Teste completo
npm run mongo:test
npm run fix:registration
curl http://localhost:5000/api/health
```

**🎉 Se todos os testes passarem, o WhatsClone está funcionando perfeitamente!**
