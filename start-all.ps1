# FinCloud - Script para Iniciar Todos os Serviços
# Este script inicia todos os serviços em terminais separados

Write-Host "🚀 Iniciando todos os serviços do FinCloud..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = $PSScriptRoot

# Função para iniciar um serviço em novo terminal
function Start-Service {
    param (
        [string]$Name,
        [string]$Path,
        [string]$Command
    )
    
    Write-Host "  → Iniciando $Name..." -ForegroundColor Yellow
    
    $fullPath = Join-Path $baseDir $Path
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$fullPath'; Write-Host '🚀 $Name' -ForegroundColor Cyan; Write-Host ''; $Command"
    
    Start-Sleep -Seconds 1
}

# Verificar se Docker está rodando
Write-Host "📦 Verificando Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>$null
if (-not $?) {
    Write-Host "⚠️  Docker não está rodando. Iniciando containers..." -ForegroundColor Yellow
    cd "$baseDir\FinCloud"
    docker-compose up -d
    Start-Sleep -Seconds 5
} else {
    Write-Host "✅ Docker OK" -ForegroundColor Green
}
Write-Host ""

# Iniciar serviços na ordem correta
Write-Host "🔧 Iniciando backend services..." -ForegroundColor Cyan
Write-Host ""

Start-Service -Name "User Service" -Path "FinCloud\user-service" -Command "npm run dev"
Start-Sleep -Seconds 3

Start-Service -Name "Transaction Service" -Path "FinCloud\transaction-service" -Command "npm run dev"
Start-Sleep -Seconds 3

Start-Service -Name "BFF (API Gateway)" -Path "FinCloud\bff" -Command "npm run dev"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🎨 Iniciando frontends..." -ForegroundColor Cyan
Write-Host ""

Start-Service -Name "FinAdmPrototype (Admin)" -Path "FinAdmPrototype" -Command "npm run dev"
Start-Sleep -Seconds 2

Start-Service -Name "FinAppPrototype (Client)" -Path "FinAppPrototype" -Command "npm run dev"

Write-Host ""
Write-Host "✅ Todos os serviços foram iniciados!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Acesse as aplicações:" -ForegroundColor Cyan
Write-Host "   Admin:  http://localhost:5174" -ForegroundColor White
Write-Host "   Client: http://localhost:5173" -ForegroundColor White
Write-Host "   BFF:    http://localhost:3000/api/docs" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Aguarde alguns segundos para todos os serviços iniciarem completamente" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para parar todos os serviços, feche os terminais abertos." -ForegroundColor Gray
Write-Host ""
