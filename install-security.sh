#!/bin/bash

# Script de instalação de dependências de segurança para WhatsClone
# Autor: Clenio Afonso de Oliveira Moura

echo "🔒 Instalando dependências de segurança para WhatsClone..."

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

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto WhatsClone"
    exit 1
fi

log "Verificando sistema..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    error "Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js 18+ é necessário. Versão atual: $(node -v)"
    exit 1
fi

log "Node.js $(node -v) ✓"

# Verificar npm
if ! command -v npm &> /dev/null; then
    error "npm não encontrado"
    exit 1
fi

log "npm $(npm -v) ✓"

# Instalar dependências de segurança no servidor
log "Instalando dependências de segurança no servidor..."
cd server

# Instalar dependências principais
npm install express-mongo-sanitize@^2.2.0 \
           express-slow-down@^1.6.0 \
           xss@^1.0.14 \
           sharp@^0.32.6 \
           redis@^4.6.10 \
           validator@^13.11.0

if [ $? -eq 0 ]; then
    log "Dependências de segurança instaladas ✓"
else
    error "Falha ao instalar dependências de segurança"
    exit 1
fi

# Criar diretórios necessários
log "Criando diretórios de segurança..."
mkdir -p logs
mkdir -p uploads/avatars
mkdir -p uploads/messages
mkdir -p temp

log "Diretórios criados ✓"

# Voltar ao diretório raiz
cd ..

# Verificar se Redis está disponível (opcional)
log "Verificando Redis..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        log "Redis está rodando ✓"
    else
        warning "Redis não está rodando. Blacklist de tokens usará memória."
        info "Para instalar Redis: sudo apt install redis-server (Ubuntu/Debian)"
    fi
else
    warning "Redis não encontrado. Blacklist de tokens usará memória."
    info "Para instalar Redis: sudo apt install redis-server (Ubuntu/Debian)"
fi

# Verificar configurações de segurança
log "Verificando configurações de segurança..."

if [ ! -f ".env" ]; then
    warning "Arquivo .env não encontrado. Copiando .env.example..."
    cp .env.example .env
    warning "Configure as variáveis de ambiente em .env antes de usar em produção!"
fi

# Verificar JWT_SECRET
if grep -q "your-super-secret-jwt-key-here" .env 2>/dev/null; then
    warning "JWT_SECRET está usando valor padrão!"
    info "Gere uma chave segura: openssl rand -base64 32"
fi

# Verificar se está em produção
if grep -q "NODE_ENV=production" .env 2>/dev/null; then
    warning "Ambiente de produção detectado!"
    info "Certifique-se de que todas as configurações de segurança estão corretas:"
    info "- JWT_SECRET único e seguro (32+ caracteres)"
    info "- CORS_ORIGIN configurado corretamente"
    info "- HTTPS habilitado"
    info "- Redis configurado para blacklist"
    info "- Logs de segurança monitorados"
fi

# Criar script de verificação de segurança
log "Criando script de verificação de segurança..."
cat > check-security.js << 'EOF'
const fs = require('fs');
const path = require('path');

console.log('🔒 Verificação de Segurança WhatsClone\n');

// Verificar .env
const envPath = '.env';
if (!fs.existsSync(envPath)) {
    console.log('❌ Arquivo .env não encontrado');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');

// Verificações
const checks = [
    {
        name: 'JWT_SECRET',
        test: () => !envContent.includes('your-super-secret-jwt-key-here'),
        message: 'JWT_SECRET deve ser alterado do valor padrão'
    },
    {
        name: 'JWT_SECRET Length',
        test: () => {
            const match = envContent.match(/JWT_SECRET=(.+)/);
            return match && match[1].length >= 32;
        },
        message: 'JWT_SECRET deve ter pelo menos 32 caracteres'
    },
    {
        name: 'CORS_ORIGIN',
        test: () => envContent.includes('CORS_ORIGIN='),
        message: 'CORS_ORIGIN deve estar configurado'
    },
    {
        name: 'Rate Limiting',
        test: () => envContent.includes('RATE_LIMIT_'),
        message: 'Configurações de rate limiting devem estar presentes'
    }
];

let passed = 0;
let failed = 0;

checks.forEach(check => {
    if (check.test()) {
        console.log(`✅ ${check.name}`);
        passed++;
    } else {
        console.log(`❌ ${check.name}: ${check.message}`);
        failed++;
    }
});

console.log(`\n📊 Resultado: ${passed} passou, ${failed} falhou`);

if (failed > 0) {
    console.log('\n⚠️  Corrija os problemas acima antes de usar em produção!');
    process.exit(1);
} else {
    console.log('\n🎉 Todas as verificações de segurança passaram!');
}
EOF

chmod +x check-security.js

log "Script de verificação criado ✓"

# Executar verificação
log "Executando verificação de segurança..."
node check-security.js

echo ""
log "🎉 Instalação de segurança concluída!"
echo ""
info "Próximos passos:"
info "1. Configure as variáveis de ambiente em .env"
info "2. Execute 'node check-security.js' para verificar configurações"
info "3. Em produção, configure HTTPS e Redis"
info "4. Monitore logs em server/logs/"
echo ""
info "Documentação de segurança: SECURITY.md"
info "Para suporte: https://github.com/clenio77/whatsclone"
echo ""
log "🔒 WhatsClone está mais seguro agora!"
