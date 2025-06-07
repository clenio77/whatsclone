#!/bin/bash

# Script para corrigir problemas de registro de usuário no WhatsClone
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

echo "🔧 WhatsClone - Correção de Registro de Usuário"
echo "=============================================="
echo ""

# 1. Verificar e iniciar MongoDB
log "Verificando MongoDB..."
if ! docker ps | grep -q whatsclone-mongo; then
    warning "MongoDB não está rodando. Iniciando com Docker..."
    docker run -d --name whatsclone-mongo -p 27017:27017 mongo:7.0 || {
        error "Falha ao iniciar MongoDB. Verifique se Docker está instalado."
        exit 1
    }
    info "Aguardando MongoDB inicializar..."
    sleep 10
fi

log "MongoDB está rodando ✓"

# 2. Verificar se as dependências estão instaladas
if [ ! -d "server/node_modules" ]; then
    log "Instalando dependências do servidor..."
    cd server && npm install && cd ..
fi

# 3. Testar registro de usuário
log "Testando registro de usuário..."
cd server && npm start &
SERVER_PID=$!
sleep 5

# Testar endpoint de registro
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "name": "Teste User",
    "email": "teste@exemplo.com", 
    "phone": "+5511999999999",
    "password": "123456789"
  }')

# Parar servidor
kill $SERVER_PID 2>/dev/null || true
cd ..

# Verificar resposta
if echo "$RESPONSE" | grep -q '"success":true'; then
    log "✅ Registro funcionando corretamente!"
    echo ""
    echo "📋 RESPOSTA DO SERVIDOR:"
    echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
else
    error "❌ Registro ainda com problemas"
    echo "📋 RESPOSTA DO SERVIDOR:"
    echo "$RESPONSE"
    exit 1
fi

echo ""
echo "🎉 Correção de registro concluída!"
echo "================================="
echo ""
echo "✅ PROBLEMAS CORRIGIDOS:"
echo "- CORS configurado corretamente"
echo "- Middleware CSRF ajustado para desenvolvimento"
echo "- Modelo User atualizado com email e senha"
echo "- Controlador de autenticação corrigido"
echo "- MongoDB iniciado e funcionando"
echo ""
echo "🚀 COMO TESTAR:"
echo "1. Iniciar aplicação:"
echo "   npm run dev"
echo ""
echo "2. Acessar frontend:"
echo "   http://localhost:3000"
echo ""
echo "3. Registrar usuário:"
echo "   - Nome: Seu Nome"
echo "   - Email: seu@email.com"
echo "   - Telefone: +5511999999999"
echo "   - Senha: suasenha123"
echo ""
echo "4. Verificação SMS:"
echo "   - Código sempre: 123456"
echo ""
echo "5. Login:"
echo "   - Email: seu@email.com"
echo "   - Senha: suasenha123"
echo ""
echo "💡 DICAS:"
echo "- MongoDB roda no Docker automaticamente"
echo "- SMS é simulado em desenvolvimento"
echo "- CORS permite localhost:3000"
echo "- Logs em server/logs/"
echo ""
log "🎊 Registro de usuário funcionando perfeitamente!"
