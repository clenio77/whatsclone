# 🐳 Guia de Ambiente Virtual - WhatsClone

Este guia mostra como criar ambientes virtuais isolados para testar o WhatsClone sem afetar seu sistema.

## 🎯 Opções Disponíveis

### **1. 🐳 Docker (Recomendado)**
- ✅ **Mais fácil** - Um comando para tudo
- ✅ **Isolamento completo** - Não afeta o sistema
- ✅ **Reproduzível** - Mesmo ambiente sempre
- ✅ **Inclui banco de dados** - MongoDB e Redis inclusos

### **2. 🔧 Node.js + MongoDB Local**
- ✅ **Mais rápido** - Desenvolvimento direto
- ✅ **Debugging fácil** - Acesso direto ao código
- ❌ **Requer instalação** - Node.js e MongoDB

### **3. ☁️ Codespaces/Gitpod**
- ✅ **Zero instalação** - Roda no navegador
- ✅ **Acesso remoto** - De qualquer lugar
- ❌ **Requer internet** - Dependente de conexão

---

## 🐳 **OPÇÃO 1: Docker (Recomendado)**

### **Pré-requisitos**
```bash
# Instalar Docker
# Windows/Mac: Docker Desktop
# Linux: Docker Engine + Docker Compose
```

### **Setup Rápido (5 minutos)**
```bash
# 1. Clonar projeto
git clone https://github.com/clenio77/whatsclone
cd whatsclone

# 2. Iniciar ambiente
./docker-dev.sh start

# 3. Criar usuário admin
./docker-dev.sh admin

# 4. Acessar
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### **Comandos Disponíveis**
```bash
./docker-dev.sh start      # Iniciar ambiente
./docker-dev.sh stop       # Parar ambiente
./docker-dev.sh restart    # Reiniciar
./docker-dev.sh clean      # Limpar tudo
./docker-dev.sh health     # Verificar saúde
./docker-dev.sh logs       # Ver logs
./docker-dev.sh admin      # Criar admin
./docker-dev.sh backup     # Backup do banco
./docker-dev.sh shell-be   # Shell no backend
```

### **Estrutura Docker**
```
whatsclone/
├── docker-compose.yml     # Orquestração dos serviços
├── docker-dev.sh         # Script de gerenciamento
├── server/Dockerfile     # Container do backend
├── client/Dockerfile     # Container do frontend
└── docker/
    ├── mongo-init.js     # Inicialização do MongoDB
    └── nginx.conf        # Configuração do Nginx
```

### **Serviços Inclusos**
- **Frontend** (React) - Porta 3000
- **Backend** (Node.js) - Porta 5000
- **MongoDB** - Porta 27017
- **Redis** - Porta 6379
- **Nginx** (opcional) - Porta 80

---

## 🔧 **OPÇÃO 2: Node.js + MongoDB Local**

### **Pré-requisitos**
```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MongoDB
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# macOS
brew install node mongodb/brew/mongodb-community

# Windows
# Baixar instaladores dos sites oficiais
```

### **Setup Manual**
```bash
# 1. Clonar e instalar
git clone https://github.com/clenio77/whatsclone
cd whatsclone
npm install

# 2. Configurar ambiente
cp .env.example .env
# Editar .env com suas configurações

# 3. Iniciar MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS

# 4. Instalar dependências
cd server && npm install
cd ../client && npm install

# 5. Iniciar aplicação
npm run dev  # Na raiz do projeto
```

### **Vantagens**
- ✅ **Performance** - Execução nativa
- ✅ **Debugging** - Acesso direto ao código
- ✅ **Hot reload** - Mudanças instantâneas

### **Desvantagens**
- ❌ **Configuração manual** - Mais passos
- ❌ **Dependências globais** - Pode conflitar
- ❌ **Limpeza manual** - Dados ficam no sistema

---

## ☁️ **OPÇÃO 3: Codespaces/Gitpod**

### **GitHub Codespaces**
```bash
# 1. Ir para o repositório no GitHub
# 2. Clicar em "Code" > "Codespaces" > "Create codespace"
# 3. Aguardar ambiente carregar
# 4. Executar no terminal:
npm run dev
```

### **Gitpod**
```bash
# 1. Acessar: https://gitpod.io/#https://github.com/clenio77/whatsclone
# 2. Fazer login com GitHub
# 3. Aguardar ambiente carregar
# 4. Executar:
npm run dev
```

### **Configuração Gitpod**
```yaml
# .gitpod.yml
tasks:
  - name: Install and Start
    init: |
      npm install
      cd server && npm install
      cd ../client && npm install
    command: npm run dev

ports:
  - port: 3000
    onOpen: open-browser
  - port: 5000
    onOpen: ignore
  - port: 27017
    onOpen: ignore

vscode:
  extensions:
    - bradlc.vscode-tailwindcss
    - esbenp.prettier-vscode
    - ms-vscode.vscode-typescript-next
```

---

## 🎯 **COMPARAÇÃO DAS OPÇÕES**

| Aspecto | Docker | Local | Cloud |
|---------|--------|-------|-------|
| **Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Performance** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Isolamento** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Debugging** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Reproduzibilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Limpeza** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🚀 **RECOMENDAÇÕES**

### **Para Iniciantes**
```bash
# Use Docker - mais fácil
git clone https://github.com/clenio77/whatsclone
cd whatsclone
./docker-dev.sh start
```

### **Para Desenvolvedores**
```bash
# Use ambiente local - mais flexível
# Instale Node.js + MongoDB
# Configure manualmente
```

### **Para Testes Rápidos**
```bash
# Use Codespaces/Gitpod - zero instalação
# Acesse pelo navegador
```

---

## 🔧 **TROUBLESHOOTING**

### **Docker**
```bash
# Problemas de permissão
sudo usermod -aG docker $USER
newgrp docker

# Limpar cache
docker system prune -a

# Verificar logs
./docker-dev.sh logs backend
```

### **Local**
```bash
# MongoDB não inicia
sudo systemctl status mongod
sudo systemctl restart mongod

# Porta ocupada
lsof -i :3000
kill -9 <PID>

# Dependências
rm -rf node_modules package-lock.json
npm install
```

### **Cloud**
```bash
# Timeout de conexão
# Verificar firewall/proxy
# Tentar novamente

# Performance lenta
# Verificar conexão internet
# Usar região mais próxima
```

---

## 📊 **MONITORAMENTO**

### **Docker**
```bash
# Status dos containers
docker-compose ps

# Uso de recursos
docker stats

# Logs em tempo real
./docker-dev.sh logs
```

### **Local**
```bash
# Processos Node.js
ps aux | grep node

# Uso de memória
free -h

# Espaço em disco
df -h
```

---

## 🎉 **PRÓXIMOS PASSOS**

Após configurar o ambiente:

1. **Testar funcionalidades básicas**
2. **Configurar IA (opcional)**
3. **Criar usuários de teste**
4. **Explorar painel admin**
5. **Personalizar configurações**

**🐳 Recomendamos Docker para a melhor experiência!**
