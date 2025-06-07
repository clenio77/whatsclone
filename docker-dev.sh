#!/bin/bash

# Script para gerenciar ambiente Docker de desenvolvimento do WhatsClone
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

# Verificar se Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado. Instale Docker primeiro."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose não está instalado. Instale Docker Compose primeiro."
        exit 1
    fi

    log "Docker e Docker Compose encontrados ✓"
}

# Criar arquivo .env se não existir
create_env() {
    if [ ! -f .env ]; then
        log "Criando arquivo .env..."
        cp .env.example .env
        warning "Configure as variáveis de ambiente em .env antes de continuar"
        info "Especialmente: JWT_SECRET, MONGODB_URI, e API keys de IA (opcional)"
    fi
}

# Iniciar ambiente de desenvolvimento
start_dev() {
    log "Iniciando ambiente de desenvolvimento..."
    
    # Build e start dos serviços
    docker-compose up --build -d mongodb redis
    
    log "Aguardando MongoDB e Redis iniciarem..."
    sleep 10
    
    # Verificar se MongoDB está pronto
    until docker-compose exec mongodb mongosh --eval "print('MongoDB ready')" &>/dev/null; do
        info "Aguardando MongoDB..."
        sleep 2
    done
    
    log "Iniciando backend e frontend..."
    docker-compose up --build -d backend frontend
    
    log "Aguardando serviços iniciarem..."
    sleep 15
    
    # Verificar saúde dos serviços
    check_health
    
    log "🎉 Ambiente de desenvolvimento iniciado com sucesso!"
    info "Frontend: http://localhost:3000"
    info "Backend: http://localhost:5000"
    info "MongoDB: localhost:27017"
    info "Redis: localhost:6379"
}

# Parar ambiente
stop() {
    log "Parando ambiente..."
    docker-compose down
    log "Ambiente parado ✓"
}

# Parar e remover tudo (incluindo volumes)
clean() {
    warning "Isso irá remover TODOS os dados (banco, uploads, etc.)"
    read -p "Tem certeza? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Limpando ambiente completo..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        log "Ambiente limpo ✓"
    else
        info "Operação cancelada"
    fi
}

# Verificar saúde dos serviços
check_health() {
    log "Verificando saúde dos serviços..."
    
    # Backend
    if curl -f http://localhost:5000/api/health &>/dev/null; then
        log "Backend: ✓ Saudável"
    else
        error "Backend: ✗ Não responsivo"
    fi
    
    # Frontend
    if curl -f http://localhost:3000 &>/dev/null; then
        log "Frontend: ✓ Saudável"
    else
        error "Frontend: ✗ Não responsivo"
    fi
    
    # MongoDB
    if docker-compose exec mongodb mongosh --eval "db.runCommand('ping')" &>/dev/null; then
        log "MongoDB: ✓ Conectado"
    else
        error "MongoDB: ✗ Não conectado"
    fi
    
    # Redis
    if docker-compose exec redis redis-cli ping &>/dev/null; then
        log "Redis: ✓ Conectado"
    else
        error "Redis: ✗ Não conectado"
    fi
}

# Ver logs
logs() {
    local service=${1:-""}
    if [ -z "$service" ]; then
        log "Mostrando logs de todos os serviços..."
        docker-compose logs -f
    else
        log "Mostrando logs do serviço: $service"
        docker-compose logs -f "$service"
    fi
}

# Criar usuário admin
create_admin() {
    log "Criando usuário administrador..."
    docker-compose exec backend npm run create-admin
}

# Executar comando no backend
backend_exec() {
    docker-compose exec backend "$@"
}

# Executar comando no frontend
frontend_exec() {
    docker-compose exec frontend "$@"
}

# Backup do banco
backup() {
    local backup_file="backup_$(date +%Y%m%d_%H%M%S).gz"
    log "Criando backup: $backup_file"
    docker-compose exec mongodb mongodump --archive --gzip --db whatsclone | gzip > "$backup_file"
    log "Backup criado: $backup_file ✓"
}

# Restaurar backup
restore() {
    local backup_file="$1"
    if [ -z "$backup_file" ]; then
        error "Especifique o arquivo de backup"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        error "Arquivo de backup não encontrado: $backup_file"
        exit 1
    fi
    
    warning "Isso irá substituir todos os dados atuais"
    read -p "Tem certeza? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Restaurando backup: $backup_file"
        gunzip -c "$backup_file" | docker-compose exec -T mongodb mongorestore --archive --gzip --drop
        log "Backup restaurado ✓"
    else
        info "Operação cancelada"
    fi
}

# Mostrar ajuda
show_help() {
    echo "🐳 WhatsClone Docker Development Environment"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start       Iniciar ambiente de desenvolvimento"
    echo "  stop        Parar ambiente"
    echo "  restart     Reiniciar ambiente"
    echo "  clean       Parar e remover tudo (incluindo dados)"
    echo "  health      Verificar saúde dos serviços"
    echo "  logs [srv]  Ver logs (opcionalmente de um serviço específico)"
    echo "  admin       Criar usuário administrador"
    echo "  backup      Fazer backup do banco de dados"
    echo "  restore     Restaurar backup do banco"
    echo "  shell-be    Abrir shell no backend"
    echo "  shell-fe    Abrir shell no frontend"
    echo "  help        Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 start                 # Iniciar ambiente"
    echo "  $0 logs backend          # Ver logs do backend"
    echo "  $0 shell-be              # Shell no container backend"
    echo "  $0 backup                # Backup do banco"
    echo ""
}

# Main
case "${1:-help}" in
    start)
        check_docker
        create_env
        start_dev
        ;;
    stop)
        check_docker
        stop
        ;;
    restart)
        check_docker
        stop
        start_dev
        ;;
    clean)
        check_docker
        clean
        ;;
    health)
        check_docker
        check_health
        ;;
    logs)
        check_docker
        logs "$2"
        ;;
    admin)
        check_docker
        create_admin
        ;;
    backup)
        check_docker
        backup
        ;;
    restore)
        check_docker
        restore "$2"
        ;;
    shell-be)
        check_docker
        docker-compose exec backend /bin/bash
        ;;
    shell-fe)
        check_docker
        docker-compose exec frontend /bin/sh
        ;;
    help|*)
        show_help
        ;;
esac
