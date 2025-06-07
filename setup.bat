@echo off
setlocal enabledelayedexpansion

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    WhatsClone Setup                         ║
echo ║              Configuração Automática Local                  ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo [INFO] Verificando pré-requisitos...

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js não encontrado. Instale Node.js 18+
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=1 delims=v" %%i in ('node --version') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js %NODE_VERSION% ✓

REM Verificar npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm não encontrado.
    pause
    exit /b 1
)

for /f %%i in ('npm --version') do set NPM_VERSION=%%i
echo [SUCCESS] npm %NPM_VERSION% ✓

REM Verificar diretório
if not exist "package.json" (
    echo [ERROR] Execute este script na raiz do projeto WhatsClone.
    pause
    exit /b 1
)

echo [SUCCESS] Diretório do projeto verificado ✓

REM Configurar .env
echo [INFO] Configurando arquivo de ambiente...

if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [SUCCESS] Arquivo .env criado ✓
        echo [WARNING] Edite o arquivo .env para configurar JWT_SECRET
    ) else (
        echo [ERROR] Arquivo .env.example não encontrado.
        pause
        exit /b 1
    )
) else (
    echo [WARNING] Arquivo .env já existe. Pulando configuração.
)

REM Instalar dependências
echo [INFO] Instalando dependências...

echo [INFO] Instalando dependências do workspace...
call npm install
if errorlevel 1 (
    echo [ERROR] Falha ao instalar dependências do workspace
    pause
    exit /b 1
)
echo [SUCCESS] Dependências do workspace instaladas ✓

echo [INFO] Instalando dependências do servidor...
cd server
call npm install
if errorlevel 1 (
    echo [ERROR] Falha ao instalar dependências do servidor
    pause
    exit /b 1
)
cd ..
echo [SUCCESS] Dependências do servidor instaladas ✓

echo [INFO] Instalando dependências do cliente...
cd client
call npm install
if errorlevel 1 (
    echo [ERROR] Falha ao instalar dependências do cliente
    pause
    exit /b 1
)
cd ..
echo [SUCCESS] Dependências do cliente instaladas ✓

REM Criar script de inicialização
echo [INFO] Criando script de inicialização...

echo @echo off > start.bat
echo echo 🚀 Iniciando WhatsClone... >> start.bat
echo echo Backend: http://localhost:5000 >> start.bat
echo echo Frontend: http://localhost:3000 >> start.bat
echo echo Health Check: http://localhost:5000/api/health >> start.bat
echo echo. >> start.bat
echo npm run dev >> start.bat

echo [SUCCESS] Script start.bat criado ✓

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    Setup Concluído!                         ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo [SUCCESS] WhatsClone configurado com sucesso!
echo.
echo Para iniciar o projeto:
echo   start.bat
echo   ou
echo   npm run dev
echo.
echo URLs importantes:
echo • Frontend: http://localhost:3000
echo • Backend:  http://localhost:5000
echo • Health:   http://localhost:5000/api/health
echo.
echo Próximos passos:
echo 1. Configurar MongoDB (local ou Atlas)
echo 2. Configurar Twilio no .env (opcional)
echo 3. Executar: start.bat
echo.
pause
