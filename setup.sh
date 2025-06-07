#!/bin/bash

# 🚀 Script de Setup Automático - WhatsClone
# Execute: chmod +x setup.sh && ./setup.sh

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    WhatsClone Setup                         ║"
echo "║              Configuração Automática Local                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado. Instale Node.js 18+ antes de continuar."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js versão 18+ é necessária. Versão atual: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) ✓"
print_success "npm $(npm --version) ✓"

# Verificar diretório
if [ ! -f "package.json" ]; then
    print_error "Execute este script na raiz do projeto WhatsClone."
    exit 1
fi

print_success "Diretório do projeto verificado ✓"

# Configurar .env
print_status "Configurando arquivo de ambiente..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Arquivo .env criado ✓"
        
        # Gerar JWT secrets
        if command -v openssl &> /dev/null; then
            JWT_SECRET=$(openssl rand -base64 32)
            JWT_REFRESH_SECRET=$(openssl rand -base64 32)
            
            sed -i.bak "s/your-super-secret-jwt-key-here/$JWT_SECRET/" .env
            sed -i.bak "s/your-refresh-token-secret-here/$JWT_REFRESH_SECRET/" .env
            rm -f .env.bak
            print_success "JWT secrets gerados automaticamente ✓"
        fi
    else
        print_error "Arquivo .env.example não encontrado."
        exit 1
    fi
else
    print_warning "Arquivo .env já existe. Pulando configuração."
fi

# Instalar dependências
print_status "Instalando dependências..."

npm install
print_success "Dependências do workspace instaladas ✓"

cd server && npm install && cd ..
print_success "Dependências do servidor instaladas ✓"

cd client && npm install && cd ..
print_success "Dependências do cliente instaladas ✓"

# Criar scripts de conveniência
print_status "Criando scripts de inicialização..."

cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando WhatsClone..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "Health Check: http://localhost:5000/api/health"
echo ""
npm run dev
EOF

chmod +x start.sh

print_success "Script start.sh criado ✓"

# Verificar MongoDB
print_status "Verificando MongoDB..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.adminCommand('ismaster')" --quiet &> /dev/null; then
        print_success "MongoDB local conectado ✓"
    else
        print_warning "MongoDB local não está rodando"
        print_warning "Configure MongoDB Atlas ou inicie: sudo systemctl start mongod"
    fi
elif command -v mongo &> /dev/null; then
    if mongo --eval "db.adminCommand('ismaster')" --quiet &> /dev/null; then
        print_success "MongoDB local conectado ✓"
    else
        print_warning "MongoDB local não está rodando"
        print_warning "Configure MongoDB Atlas ou inicie: sudo systemctl start mongod"
    fi
else
    print_warning "MongoDB CLI não encontrado"
    print_warning "Configure MongoDB Atlas no arquivo .env"
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    Setup Concluído!                         ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
print_success "WhatsClone configurado com sucesso!"
echo ""
echo -e "${BLUE}Para iniciar o projeto:${NC}"
echo "  ./start.sh"
echo "  ou"
echo "  npm run dev"
echo ""
echo -e "${BLUE}URLs importantes:${NC}"
echo "• Frontend: http://localhost:3000"
echo "• Backend:  http://localhost:5000"
echo "• Health:   http://localhost:5000/api/health"
echo ""
echo -e "${YELLOW}Próximos passos:${NC}"
echo "1. Configurar MongoDB (se necessário)"
echo "2. Configurar Twilio no .env (opcional)"
echo "3. Executar: ./start.sh"
echo ""
