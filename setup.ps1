# FinCloud - Script de Setup Completo
# Este script configura todo o ambiente de desenvolvimento

Write-Host "🚀 FinCloud - Setup Completo" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Função para verificar se um comando existe
function Test-Command($command) {
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Verificar pré-requisitos
Write-Host "📋 Verificando pré-requisitos..." -ForegroundColor Yellow

if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js não encontrado. Por favor, instale o Node.js v20.x" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "npm")) {
    Write-Host "❌ npm não encontrado. Por favor, instale o npm" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "docker")) {
    Write-Host "⚠️  Docker não encontrado. Você precisará instalar o Docker para os bancos de dados" -ForegroundColor Yellow
}

Write-Host "✅ Pré-requisitos OK" -ForegroundColor Green
Write-Host ""

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
Write-Host ""

# BFF
Write-Host "  → BFF..." -ForegroundColor Cyan
cd "$PSScriptRoot\FinCloud\bff"
npm install --silent
if ($?) { Write-Host "  ✅ BFF OK" -ForegroundColor Green } else { Write-Host "  ❌ BFF Erro" -ForegroundColor Red }

# User Service
Write-Host "  → User Service..." -ForegroundColor Cyan
cd "$PSScriptRoot\FinCloud\user-service"
npm install --silent
if ($?) { Write-Host "  ✅ User Service OK" -ForegroundColor Green } else { Write-Host "  ❌ User Service Erro" -ForegroundColor Red }

# Transaction Service
Write-Host "  → Transaction Service..." -ForegroundColor Cyan
cd "$PSScriptRoot\FinCloud\transaction-service"
npm install --silent
if ($?) { Write-Host "  ✅ Transaction Service OK" -ForegroundColor Green } else { Write-Host "  ❌ Transaction Service Erro" -ForegroundColor Red }

# FinAdmPrototype
Write-Host "  → FinAdmPrototype (Admin)..." -ForegroundColor Cyan
cd "$PSScriptRoot\FinAdmPrototype"
npm install --silent
if ($?) { Write-Host "  ✅ FinAdmPrototype OK" -ForegroundColor Green } else { Write-Host "  ❌ FinAdmPrototype Erro" -ForegroundColor Red }

# FinAppPrototype
Write-Host "  → FinAppPrototype (Client)..." -ForegroundColor Cyan
cd "$PSScriptRoot\FinAppPrototype"
npm install --silent
if ($?) { Write-Host "  ✅ FinAppPrototype OK" -ForegroundColor Green } else { Write-Host "  ❌ FinAppPrototype Erro" -ForegroundColor Red }

Write-Host ""
Write-Host "✅ Todas as dependências instaladas!" -ForegroundColor Green
Write-Host ""

# Criar arquivos .env se não existirem
Write-Host "📝 Configurando arquivos .env..." -ForegroundColor Yellow

# BFF .env
$bffEnvPath = "$PSScriptRoot\FinCloud\bff\.env"
if (-not (Test-Path $bffEnvPath)) {
    Copy-Item "$PSScriptRoot\FinCloud\bff\.env.example" $bffEnvPath
    Write-Host "  ✅ BFF .env criado" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  BFF .env já existe" -ForegroundColor Gray
}

# FinAdmPrototype .env
$admEnvPath = "$PSScriptRoot\FinAdmPrototype\.env"
if (-not (Test-Path $admEnvPath)) {
    Copy-Item "$PSScriptRoot\FinAdmPrototype\.env.example" $admEnvPath
    Write-Host "  ✅ FinAdmPrototype .env criado" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  FinAdmPrototype .env já existe" -ForegroundColor Gray
}

# FinAppPrototype .env
$appEnvPath = "$PSScriptRoot\FinAppPrototype\.env"
if (-not (Test-Path $appEnvPath)) {
    Copy-Item "$PSScriptRoot\FinAppPrototype\.env.example" $appEnvPath
    Write-Host "  ✅ FinAppPrototype .env criado" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  FinAppPrototype .env já existe" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Arquivos .env configurados!" -ForegroundColor Green
Write-Host ""

# Instruções finais
Write-Host "🎉 Setup concluído com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Próximos passos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Iniciar os bancos de dados (Docker):" -ForegroundColor Yellow
Write-Host "   cd FinCloud" -ForegroundColor White
Write-Host "   docker-compose up -d" -ForegroundColor White
Write-Host ""
Write-Host "2. Iniciar os serviços (em terminais separados):" -ForegroundColor Yellow
Write-Host "   cd FinCloud\user-service && npm run dev" -ForegroundColor White
Write-Host "   cd FinCloud\transaction-service && npm run dev" -ForegroundColor White
Write-Host "   cd FinCloud\bff && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Iniciar os frontends (em terminais separados):" -ForegroundColor Yellow
Write-Host "   cd FinAdmPrototype && npm run dev" -ForegroundColor White
Write-Host "   cd FinAppPrototype && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "4. Acessar as aplicações:" -ForegroundColor Yellow
Write-Host "   Admin:  http://localhost:5174" -ForegroundColor White
Write-Host "   Client: http://localhost:5173" -ForegroundColor White
Write-Host "   BFF:    http://localhost:3000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "📖 Para mais informações, consulte: INTEGRATION.md" -ForegroundColor Cyan
Write-Host ""

# Voltar ao diretório original
cd $PSScriptRoot
