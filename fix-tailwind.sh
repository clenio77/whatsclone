#!/bin/bash

# Script para corrigir problemas comuns do Tailwind CSS no WhatsClone
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
if [ ! -f "client/package.json" ]; then
    error "Execute este script no diretório raiz do projeto WhatsClone"
    exit 1
fi

log "🎨 Corrigindo problemas do Tailwind CSS..."

# 1. Limpar cache do Vite
log "Limpando cache do Vite..."
cd client
rm -rf node_modules/.vite
rm -rf dist

# 2. Reinstalar dependências
log "Reinstalando dependências..."
npm install

# 3. Verificar se Tailwind está instalado
log "Verificando instalação do Tailwind..."
if ! npm list tailwindcss &>/dev/null; then
    warning "Tailwind CSS não encontrado. Instalando..."
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
fi

# 4. Verificar configuração do PostCSS
log "Verificando configuração do PostCSS..."
if [ ! -f "postcss.config.js" ]; then
    log "Criando postcss.config.js..."
    cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
fi

# 5. Verificar se há classes problemáticas
log "Verificando classes problemáticas..."
problematic_classes=(
    "border-border"
    "ring-ring"
    "ring-offset-background"
    "bg-background"
    "text-foreground"
)

for class in "${problematic_classes[@]}"; do
    if grep -r "$class" src/ &>/dev/null; then
        warning "Classe problemática encontrada: $class"
        info "Substituindo automaticamente..."
        
        case $class in
            "border-border")
                find src/ -type f -name "*.tsx" -o -name "*.ts" -o -name "*.css" | xargs sed -i 's/border-border/border-gray-200 dark:border-dark-border/g'
                ;;
            "ring-ring")
                find src/ -type f -name "*.tsx" -o -name "*.ts" -o -name "*.css" | xargs sed -i 's/ring-ring/ring-blue-500/g'
                ;;
            "ring-offset-background")
                find src/ -type f -name "*.tsx" -o -name "*.ts" -o -name "*.css" | xargs sed -i 's/ring-offset-background//g'
                ;;
            "bg-background")
                find src/ -type f -name "*.tsx" -o -name "*.ts" -o -name "*.css" | xargs sed -i 's/bg-background/bg-white dark:bg-dark-bg/g'
                ;;
            "text-foreground")
                find src/ -type f -name "*.tsx" -o -name "*.ts" -o -name "*.css" | xargs sed -i 's/text-foreground/text-gray-900 dark:text-dark-text/g'
                ;;
        esac
    fi
done

# 6. Testar compilação
log "Testando compilação do Tailwind..."
if npx tailwindcss -i src/styles/globals.css -o dist/test.css &>/dev/null; then
    log "✅ Compilação do Tailwind bem-sucedida"
    rm -f dist/test.css
else
    error "❌ Erro na compilação do Tailwind"
    exit 1
fi

# 7. Testar Vite
log "Testando servidor de desenvolvimento..."
timeout 10s npm run dev &>/dev/null && log "✅ Vite iniciou sem erros" || warning "⚠️ Verifique manualmente se há erros no Vite"

cd ..

log "🎉 Correções do Tailwind concluídas!"
info "Execute 'cd client && npm run dev' para iniciar o servidor"
