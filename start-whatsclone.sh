#!/bin/bash

# Script para iniciar WhatsClone com todas as dependências
# Autor: Clenio Afonso de Oliveira Moura

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto WhatsClone"
    exit 1
fi

echo "🚀 WhatsClone - Inicialização Completa"
echo "====================================="
echo ""

# 1. Verificar e iniciar MongoDB
log "Verificando MongoDB..."
if ! ./mongodb-manager.sh status &>/dev/null; then
    warning "MongoDB não está funcionando. Iniciando..."
    ./mongodb-manager.sh start
else
    log "MongoDB já está rodando ✓"
fi

# 2. Verificar dependências
log "Verificando dependências..."

if [ ! -d "node_modules" ]; then
    log "Instalando dependências do workspace..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    log "Instalando dependências do servidor..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    log "Instalando dependências do cliente..."
    cd client && npm install && cd ..
fi

# 3. Verificar arquivo .env
if [ ! -f ".env" ]; then
    warning "Arquivo .env não encontrado. Criando..."
    cp .env.example .env
    warning "Configure as variáveis de ambiente em .env"
fi

# 4. Testar conexão MongoDB
log "Testando conexão com MongoDB..."
./mongodb-manager.sh test

# 5. Criar usuários de teste (opcional)
read -p "Deseja criar usuários de teste? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Criando usuários de teste..."
    cd server
    npm run create-test-users 2>/dev/null || warning "Erro ao criar usuários de teste (talvez já existam)"
    cd ..
fi

# 6. Iniciar aplicação
echo ""
log "🎉 Tudo pronto! Iniciando WhatsClone..."
echo ""
echo "📋 INFORMAÇÕES:"
echo "- MongoDB: ✅ Rodando na porta 27017"
echo "- Backend: 🔄 Iniciando na porta 5000"
echo "- Frontend: 🔄 Iniciando na porta 3000"
echo ""
echo "🌐 ACESSOS:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:5000"
echo "- Health Check: http://localhost:5000/api/health"
echo ""
echo "👤 USUÁRIOS DE TESTE:"
echo "- joao@teste.com / 123456789"
echo "- maria@teste.com / 123456789"
echo "- admin@whatsclone.com / admin123456 (admin)"
echo ""
echo "💡 DICAS:"
echo "- Use Ctrl+C para parar"
echo "- SMS código sempre: 123456"
echo "- Logs em server/logs/"
echo ""

# Aguardar um pouco para o usuário ler
sleep 3

# Iniciar aplicação
log "Iniciando aplicação..."
npm run dev
