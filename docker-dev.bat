@echo off
REM Script para gerenciar ambiente Docker de desenvolvimento do WhatsClone (Windows)
REM Autor: Clenio Afonso de Oliveira Moura

setlocal enabledelayedexpansion

REM Verificar se Docker está instalado
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker nao esta instalado. Instale Docker Desktop primeiro.
    exit /b 1
)

where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose nao esta instalado. Instale Docker Desktop primeiro.
    exit /b 1
)

REM Criar arquivo .env se não existir
if not exist .env (
    echo [INFO] Criando arquivo .env...
    copy .env.example .env >nul
    echo [WARNING] Configure as variaveis de ambiente em .env antes de continuar
)

REM Processar comando
set command=%1
if "%command%"=="" set command=help

if "%command%"=="start" goto start
if "%command%"=="stop" goto stop
if "%command%"=="restart" goto restart
if "%command%"=="clean" goto clean
if "%command%"=="health" goto health
if "%command%"=="logs" goto logs
if "%command%"=="admin" goto admin
if "%command%"=="backup" goto backup
if "%command%"=="shell-be" goto shell_be
if "%command%"=="shell-fe" goto shell_fe
if "%command%"=="help" goto help
goto help

:start
echo [INFO] Iniciando ambiente de desenvolvimento...
docker-compose up --build -d mongodb redis
echo [INFO] Aguardando MongoDB e Redis iniciarem...
timeout /t 10 /nobreak >nul
echo [INFO] Iniciando backend e frontend...
docker-compose up --build -d backend frontend
echo [INFO] Aguardando servicos iniciarem...
timeout /t 15 /nobreak >nul
echo [SUCCESS] Ambiente de desenvolvimento iniciado com sucesso!
echo [INFO] Frontend: http://localhost:3000
echo [INFO] Backend: http://localhost:5000
echo [INFO] MongoDB: localhost:27017
echo [INFO] Redis: localhost:6379
goto end

:stop
echo [INFO] Parando ambiente...
docker-compose down
echo [SUCCESS] Ambiente parado
goto end

:restart
echo [INFO] Reiniciando ambiente...
docker-compose down
goto start

:clean
echo [WARNING] Isso ira remover TODOS os dados (banco, uploads, etc.)
set /p confirm="Tem certeza? (y/N): "
if /i "%confirm%"=="y" (
    echo [INFO] Limpando ambiente completo...
    docker-compose down -v --remove-orphans
    docker system prune -f
    echo [SUCCESS] Ambiente limpo
) else (
    echo [INFO] Operacao cancelada
)
goto end

:health
echo [INFO] Verificando saude dos servicos...
curl -f http://localhost:5000/api/health >nul 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Backend: Saudavel
) else (
    echo [ERROR] Backend: Nao responsivo
)

curl -f http://localhost:3000 >nul 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Frontend: Saudavel
) else (
    echo [ERROR] Frontend: Nao responsivo
)
goto end

:logs
set service=%2
if "%service%"=="" (
    echo [INFO] Mostrando logs de todos os servicos...
    docker-compose logs -f
) else (
    echo [INFO] Mostrando logs do servico: %service%
    docker-compose logs -f %service%
)
goto end

:admin
echo [INFO] Criando usuario administrador...
docker-compose exec backend npm run create-admin
goto end

:backup
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "backup_file=backup_%dt:~0,8%_%dt:~8,6%.gz"
echo [INFO] Criando backup: %backup_file%
docker-compose exec mongodb mongodump --archive --gzip --db whatsclone > %backup_file%
echo [SUCCESS] Backup criado: %backup_file%
goto end

:shell_be
echo [INFO] Abrindo shell no backend...
docker-compose exec backend /bin/bash
goto end

:shell_fe
echo [INFO] Abrindo shell no frontend...
docker-compose exec frontend /bin/sh
goto end

:help
echo.
echo 🐳 WhatsClone Docker Development Environment (Windows)
echo.
echo Uso: %0 [comando]
echo.
echo Comandos disponiveis:
echo   start       Iniciar ambiente de desenvolvimento
echo   stop        Parar ambiente
echo   restart     Reiniciar ambiente
echo   clean       Parar e remover tudo (incluindo dados)
echo   health      Verificar saude dos servicos
echo   logs [srv]  Ver logs (opcionalmente de um servico especifico)
echo   admin       Criar usuario administrador
echo   backup      Fazer backup do banco de dados
echo   shell-be    Abrir shell no backend
echo   shell-fe    Abrir shell no frontend
echo   help        Mostrar esta ajuda
echo.
echo Exemplos:
echo   %0 start                 # Iniciar ambiente
echo   %0 logs backend          # Ver logs do backend
echo   %0 shell-be              # Shell no container backend
echo   %0 backup                # Backup do banco
echo.

:end
endlocal
