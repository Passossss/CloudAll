@echo off
echo 🚀 Iniciando Fin App - Microservices Architecture
echo ==================================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não está rodando. Por favor, inicie o Docker primeiro.
    pause
    exit /b 1
)

echo 📦 Configurando arquivos .env...
node setup-env.js

echo 🐳 Iniciando bancos de dados com Docker...
docker-compose up -d

echo ⏳ Aguardando bancos de dados ficarem prontos...
timeout /t 30 /nobreak >nul

echo 🔧 Inicializando banco de dados SQL Server...
docker exec fin-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P FinApp123! -i /docker-entrypoint-initdb.d/init-db.sql

echo 📊 Instalando dependências dos microserviços...
npm run install-all

echo 🎉 Configuração concluída!
echo.
echo 📋 Próximos passos:
echo 1. Execute: npm run dev
echo 2. Acesse FinApp: http://localhost:5173
echo 3. Acesse FinAdm: http://localhost:5174
echo.
echo 🔗 URLs dos serviços:
echo - BFF: http://localhost:3000
echo - User Service: http://localhost:3001
echo - Transaction Service: http://localhost:3002
echo - SQL Server: localhost:1433
echo - MongoDB: localhost:27017

pause
