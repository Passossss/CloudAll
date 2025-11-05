# Script de Deploy para Azure
# Execute: .\deploy-azure.ps1

param(
    [string]$ResourceGroup = "FinArq",
    [string]$Location = "BrazilSouth",
    [switch]$SkipFunctions = $false,
    [switch]$SkipServices = $false
)

Write-Host "🚀 Iniciando deploy do FinCloud para Azure..." -ForegroundColor Green
Write-Host ""

# Verificar se está logado
Write-Host "Verificando login no Azure..." -ForegroundColor Yellow
$account = az account show 2>$null
if (-not $account) {
    Write-Host "❌ Não está logado no Azure. Fazendo login..." -ForegroundColor Red
    az login
}

# Deploy Azure Functions
if (-not $SkipFunctions) {
    Write-Host ""
    Write-Host "📦 Deployando Azure Functions..." -ForegroundColor Cyan
    
    # MongoDB Function
    Write-Host "  → MongoDB Function..." -ForegroundColor Yellow
    Push-Location "azure-functions/mongodb-function"
    if (Test-Path "node_modules") {
        Write-Host "    Dependências já instaladas" -ForegroundColor Gray
    } else {
        npm install --production
    }
    func azure functionapp publish fincloud --javascript --force
    Pop-Location
    
    # Azure SQL Function
    Write-Host "  → Azure SQL Function..." -ForegroundColor Yellow
    Push-Location "azure-functions/azuresql-function"
    if (Test-Path "node_modules") {
        Write-Host "    Dependências já instaladas" -ForegroundColor Gray
    } else {
        npm install --production
    }
    func azure functionapp publish fincloud --javascript --force
    Pop-Location
    
    Write-Host "✅ Azure Functions deployadas!" -ForegroundColor Green
}

# Deploy Services
if (-not $SkipServices) {
    Write-Host ""
    Write-Host "📦 Deployando Microserviços..." -ForegroundColor Cyan
    
    # User Service
    Write-Host "  → User Service..." -ForegroundColor Yellow
    Push-Location "user-service"
    npm install --production
    if (Test-Path "deploy.zip") {
        Remove-Item "deploy.zip" -Force
    }
    Get-ChildItem -Path . -Exclude "node_modules",".git",".gitignore","*.test.js","*.md","tests" | 
        Compress-Archive -DestinationPath "deploy.zip" -Force
    az webapp deployment source config-zip `
        --resource-group $ResourceGroup `
        --name fincloud-user-service `
        --src deploy.zip
    Pop-Location
    Write-Host "    ✅ User Service deployado" -ForegroundColor Green
    
    # Transaction Service
    Write-Host "  → Transaction Service..." -ForegroundColor Yellow
    Push-Location "transaction-service"
    npm install --production
    if (Test-Path "deploy.zip") {
        Remove-Item "deploy.zip" -Force
    }
    Get-ChildItem -Path . -Exclude "node_modules",".git",".gitignore","*.test.js","*.md","tests" | 
        Compress-Archive -DestinationPath "deploy.zip" -Force
    az webapp deployment source config-zip `
        --resource-group $ResourceGroup `
        --name fincloud-transaction-service `
        --src deploy.zip
    Pop-Location
    Write-Host "    ✅ Transaction Service deployado" -ForegroundColor Green
    
    # BFF
    Write-Host "  → BFF..." -ForegroundColor Yellow
    Push-Location "bff"
    npm install --production
    if (Test-Path "deploy.zip") {
        Remove-Item "deploy.zip" -Force
    }
    Get-ChildItem -Path . -Exclude "node_modules",".git",".gitignore","*.test.js","*.md" | 
        Compress-Archive -DestinationPath "deploy.zip" -Force
    az webapp deployment source config-zip `
        --resource-group $ResourceGroup `
        --name fincloud-bff `
        --src deploy.zip
    Pop-Location
    Write-Host "    ✅ BFF deployado" -ForegroundColor Green
    
    Write-Host "✅ Todos os serviços foram deployados!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Deploy concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 URLs:" -ForegroundColor Cyan
Write-Host "  BFF: https://fincloud-bff.azurewebsites.net/api" -ForegroundColor White
Write-Host "  User Service: https://fincloud-user-service.azurewebsites.net" -ForegroundColor White
Write-Host "  Transaction Service: https://fincloud-transaction-service.azurewebsites.net" -ForegroundColor White
Write-Host "  Functions: https://fincloud.azurewebsites.net/api" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Lembre-se de configurar as variáveis de ambiente no Portal Azure!" -ForegroundColor Yellow

