#!/bin/bash

# Script para gerenciar MongoDB do WhatsClone
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

# Configurações
CONTAINER_NAME="whatsclone-mongo"
MONGO_PORT="27017"
MONGO_IMAGE="mongo:7.0"

# Verificar se Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado. Instale Docker primeiro."
        echo ""
        echo "📥 INSTALAÇÃO DO DOCKER:"
        echo "Ubuntu/Debian: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
        echo "CentOS/RHEL: sudo yum install docker"
        echo "macOS: brew install docker"
        echo "Windows: Baixe Docker Desktop"
        exit 1
    fi
    log "Docker encontrado ✓"
}

# Verificar status do MongoDB
check_mongo_status() {
    if docker ps | grep -q "$CONTAINER_NAME"; then
        log "MongoDB está rodando ✓"
        return 0
    elif docker ps -a | grep -q "$CONTAINER_NAME"; then
        warning "MongoDB existe mas está parado"
        return 1
    else
        warning "MongoDB não existe"
        return 2
    fi
}

# Iniciar MongoDB
start_mongo() {
    log "Iniciando MongoDB..."
    
    case $(check_mongo_status; echo $?) in
        0)
            log "MongoDB já está rodando"
            ;;
        1)
            log "Reiniciando container existente..."
            docker start "$CONTAINER_NAME"
            ;;
        2)
            log "Criando novo container MongoDB..."
            docker run -d \
                --name "$CONTAINER_NAME" \
                -p "$MONGO_PORT:27017" \
                -v whatsclone-mongo-data:/data/db \
                --restart unless-stopped \
                "$MONGO_IMAGE"
            ;;
    esac
    
    # Aguardar MongoDB ficar pronto
    log "Aguardando MongoDB ficar pronto..."
    for i in {1..30}; do
        if docker exec "$CONTAINER_NAME" mongosh --eval "db.runCommand('ping')" &>/dev/null; then
            log "MongoDB está pronto ✓"
            return 0
        fi
        sleep 1
    done
    
    error "MongoDB não ficou pronto em 30 segundos"
    return 1
}

# Parar MongoDB
stop_mongo() {
    log "Parando MongoDB..."
    if docker ps | grep -q "$CONTAINER_NAME"; then
        docker stop "$CONTAINER_NAME"
        log "MongoDB parado ✓"
    else
        warning "MongoDB não está rodando"
    fi
}

# Remover MongoDB
remove_mongo() {
    warning "Isso irá remover o container MongoDB (dados serão preservados no volume)"
    read -p "Tem certeza? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Removendo container MongoDB..."
        docker stop "$CONTAINER_NAME" 2>/dev/null || true
        docker rm "$CONTAINER_NAME" 2>/dev/null || true
        log "Container removido ✓"
    else
        info "Operação cancelada"
    fi
}

# Limpar tudo (incluindo dados)
clean_all() {
    warning "Isso irá remover TODOS os dados do MongoDB!"
    read -p "Tem certeza? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Removendo container e dados..."
        docker stop "$CONTAINER_NAME" 2>/dev/null || true
        docker rm "$CONTAINER_NAME" 2>/dev/null || true
        docker volume rm whatsclone-mongo-data 2>/dev/null || true
        log "Tudo removido ✓"
    else
        info "Operação cancelada"
    fi
}

# Verificar conexão
test_connection() {
    log "Testando conexão com MongoDB..."
    
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        error "MongoDB não está rodando"
        return 1
    fi
    
    if docker exec "$CONTAINER_NAME" mongosh --eval "db.runCommand('ping')" &>/dev/null; then
        log "✅ Conexão com MongoDB funcionando"
        
        # Testar conexão do Node.js
        if [ -f "server/package.json" ]; then
            log "Testando conexão do Node.js..."
            cd server
            timeout 10s node -e "
                const mongoose = require('mongoose');
                mongoose.connect('mongodb://localhost:27017/whatsclone')
                .then(() => {
                    console.log('✅ Node.js conectou ao MongoDB');
                    process.exit(0);
                })
                .catch(err => {
                    console.error('❌ Erro Node.js:', err.message);
                    process.exit(1);
                });
            " && log "✅ Node.js conecta corretamente" || error "❌ Node.js não consegue conectar"
            cd ..
        fi
    else
        error "❌ Não foi possível conectar ao MongoDB"
        return 1
    fi
}

# Ver logs do MongoDB
show_logs() {
    log "Mostrando logs do MongoDB..."
    docker logs -f "$CONTAINER_NAME"
}

# Status detalhado
show_status() {
    echo "🐳 Status do MongoDB - WhatsClone"
    echo "================================"
    echo ""
    
    # Status do container
    if docker ps | grep -q "$CONTAINER_NAME"; then
        echo "📊 Container: ✅ Rodando"
        echo "🔗 Porta: $MONGO_PORT"
        echo "📦 Imagem: $MONGO_IMAGE"
        echo "💾 Volume: whatsclone-mongo-data"
        
        # Informações do container
        echo ""
        echo "📋 Detalhes do Container:"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep "$CONTAINER_NAME"
        
        # Testar conexão
        echo ""
        test_connection
    else
        echo "📊 Container: ❌ Não está rodando"
        if docker ps -a | grep -q "$CONTAINER_NAME"; then
            echo "💡 Container existe mas está parado"
            echo "🔧 Execute: $0 start"
        else
            echo "💡 Container não existe"
            echo "🔧 Execute: $0 start"
        fi
    fi
    
    echo ""
    echo "💾 Volumes Docker:"
    docker volume ls | grep whatsclone || echo "Nenhum volume encontrado"
}

# Backup do banco
backup_db() {
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        error "MongoDB não está rodando"
        return 1
    fi
    
    local backup_file="whatsclone-backup-$(date +%Y%m%d_%H%M%S).gz"
    log "Criando backup: $backup_file"
    
    docker exec "$CONTAINER_NAME" mongodump --archive --gzip --db whatsclone | gzip > "$backup_file"
    log "Backup criado: $backup_file ✓"
}

# Restaurar backup
restore_db() {
    local backup_file="$1"
    if [ -z "$backup_file" ]; then
        error "Especifique o arquivo de backup"
        echo "Uso: $0 restore backup-file.gz"
        return 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        error "Arquivo de backup não encontrado: $backup_file"
        return 1
    fi
    
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        error "MongoDB não está rodando"
        return 1
    fi
    
    warning "Isso irá substituir todos os dados atuais"
    read -p "Tem certeza? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Restaurando backup: $backup_file"
        gunzip -c "$backup_file" | docker exec -i "$CONTAINER_NAME" mongorestore --archive --gzip --drop
        log "Backup restaurado ✓"
    else
        info "Operação cancelada"
    fi
}

# Mostrar ajuda
show_help() {
    echo "🐳 MongoDB Manager - WhatsClone"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start       Iniciar MongoDB"
    echo "  stop        Parar MongoDB"
    echo "  restart     Reiniciar MongoDB"
    echo "  status      Mostrar status detalhado"
    echo "  test        Testar conexão"
    echo "  logs        Mostrar logs"
    echo "  backup      Fazer backup do banco"
    echo "  restore     Restaurar backup"
    echo "  remove      Remover container (preserva dados)"
    echo "  clean       Remover tudo (incluindo dados)"
    echo "  help        Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 start                    # Iniciar MongoDB"
    echo "  $0 test                     # Testar conexão"
    echo "  $0 backup                   # Backup do banco"
    echo "  $0 restore backup.gz        # Restaurar backup"
    echo ""
}

# Main
case "${1:-help}" in
    start)
        check_docker
        start_mongo
        ;;
    stop)
        check_docker
        stop_mongo
        ;;
    restart)
        check_docker
        stop_mongo
        start_mongo
        ;;
    status)
        check_docker
        show_status
        ;;
    test)
        check_docker
        test_connection
        ;;
    logs)
        check_docker
        show_logs
        ;;
    backup)
        check_docker
        backup_db
        ;;
    restore)
        check_docker
        restore_db "$2"
        ;;
    remove)
        check_docker
        remove_mongo
        ;;
    clean)
        check_docker
        clean_all
        ;;
    help|*)
        show_help
        ;;
esac
