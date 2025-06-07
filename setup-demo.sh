#!/bin/bash

# Script para setup completo de demonstração do WhatsClone
# Cria admin + usuários de teste para demonstração
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
if [ ! -f "server/package.json" ]; then
    error "Execute este script no diretório raiz do projeto WhatsClone"
    exit 1
fi

echo "🚀 WhatsClone - Setup de Demonstração"
echo "======================================"
echo ""

# 1. Verificar se MongoDB está rodando
log "Verificando MongoDB..."
if ! mongosh --eval "db.runCommand('ping')" &>/dev/null; then
    warning "MongoDB não está rodando"
    info "Iniciando MongoDB com Docker..."
    docker run -d --name whatsclone-mongo -p 27017:27017 mongo:7.0 || {
        error "Falha ao iniciar MongoDB. Instale MongoDB ou Docker primeiro."
        exit 1
    }
    sleep 5
fi

log "MongoDB está rodando ✓"

# 2. Instalar dependências se necessário
if [ ! -d "server/node_modules" ]; then
    log "Instalando dependências do servidor..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    log "Instalando dependências do cliente..."
    cd client && npm install && cd ..
fi

# 3. Criar usuário administrador
log "Criando usuário administrador..."
cd server
npm run create-admin

# 4. Criar usuários de teste
log "Criando usuários de teste..."
npm run create-test-users

cd ..

# 5. Mostrar informações de login
echo ""
echo "🎉 Setup de demonstração concluído!"
echo "=================================="
echo ""
echo "👨‍💼 ADMINISTRADOR:"
echo "📧 Email: admin@whatsclone.com"
echo "🔑 Senha: admin123456"
echo "🛡️ Acesso: Clique no ícone 🛡️ no chat"
echo ""
echo "👤 USUÁRIOS DE TESTE:"
echo "📧 joao@teste.com    🔑 123456789"
echo "📧 maria@teste.com   🔑 123456789"
echo "📧 pedro@teste.com   🔑 123456789"
echo "📧 ana@teste.com     🔑 123456789"
echo "📧 carlos@teste.com  🔑 123456789"
echo ""
echo "🚀 COMO TESTAR:"
echo "1. Iniciar aplicação:"
echo "   npm run dev"
echo ""
echo "2. Acessar:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:5000"
echo ""
echo "3. Fazer login:"
echo "   - Use qualquer email de teste acima"
echo "   - Senha: 123456789"
echo ""
echo "4. Testar chat:"
echo "   - Abra 2 abas do navegador"
echo "   - Faça login com usuários diferentes"
echo "   - Inicie uma conversa"
echo ""
echo "5. Testar admin:"
echo "   - Login com admin@whatsclone.com"
echo "   - Clique no ícone 🛡️"
echo "   - Gerencie usuários"
echo ""
echo "💡 DICAS:"
echo "- SMS é simulado (código sempre: 123456)"
echo "- Configure IA no .env (opcional)"
echo "- Veja logs em server/logs/"
echo ""
echo "📚 DOCUMENTAÇÃO:"
echo "- README.md - Visão geral"
echo "- QUICK_START.md - Início rápido"
echo "- ADMIN_GUIDE.md - Administração"
echo ""
log "🎊 Divirta-se testando o WhatsClone!"
