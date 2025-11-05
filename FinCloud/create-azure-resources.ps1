# Script para criar recursos Azure necessários
# Execute: .\create-azure-resources.ps1

param(
    [string]$ResourceGroup = "FinArq",
    [string]$Location = "BrazilSouth"
)

Write-Host "🔧 Criando recursos Azure para FinCloud..." -ForegroundColor Green
Write-Host ""

# Verificar se está logado
$account = az account show 2>$null
if (-not $account) {
    Write-Host "❌ Não está logado no Azure. Fazendo login..." -ForegroundColor Red
    az login
}

# Verificar se Resource Group existe
Write-Host "Verificando Resource Group..." -ForegroundColor Yellow
$rgExists = az group exists --name $ResourceGroup
if ($rgExists -eq "false") {
    Write-Host "Criando Resource Group: $ResourceGroup..." -ForegroundColor Yellow
    az group create --name $ResourceGroup --location $Location
} else {
    Write-Host "✅ Resource Group já existe" -ForegroundColor Green
}

# Criar App Service Plan (se não existir)
Write-Host ""
Write-Host "Criando App Service Plan..." -ForegroundColor Yellow
$planName = "ASP-FinArq-services"
$planExists = az appservice plan show --name $planName --resource-group $ResourceGroup 2>$null

if (-not $planExists) {
    az appservice plan create `
        --name $planName `
        --resource-group $ResourceGroup `
        --location $Location `
        --sku B1 `
        --is-linux
    Write-Host "✅ App Service Plan criado" -ForegroundColor Green
} else {
    Write-Host "✅ App Service Plan já existe" -ForegroundColor Green
}

# Criar User Service App Service
Write-Host ""
Write-Host "Criando App Service: fincloud-user-service..." -ForegroundColor Yellow
$userServiceExists = az webapp show --name fincloud-user-service --resource-group $ResourceGroup 2>$null

if (-not $userServiceExists) {
    az webapp create `
        --name fincloud-user-service `
        --resource-group $ResourceGroup `
        --plan $planName `
        --runtime "NODE:20-lts"
    Write-Host "✅ User Service criado" -ForegroundColor Green
} else {
    Write-Host "✅ User Service já existe" -ForegroundColor Green
}

# Criar Transaction Service App Service
Write-Host ""
Write-Host "Criando App Service: fincloud-transaction-service..." -ForegroundColor Yellow
$transactionServiceExists = az webapp show --name fincloud-transaction-service --resource-group $ResourceGroup 2>$null

if (-not $transactionServiceExists) {
    az webapp create `
        --name fincloud-transaction-service `
        --resource-group $ResourceGroup `
        --plan $planName `
        --runtime "NODE:20-lts"
    Write-Host "✅ Transaction Service criado" -ForegroundColor Green
} else {
    Write-Host "✅ Transaction Service já existe" -ForegroundColor Green
}

# Criar BFF App Service
Write-Host ""
Write-Host "Criando App Service: fincloud-bff..." -ForegroundColor Yellow
$bffExists = az webapp show --name fincloud-bff --resource-group $ResourceGroup 2>$null

if (-not $bffExists) {
    az webapp create `
        --name fincloud-bff `
        --resource-group $ResourceGroup `
        --plan $planName `
        --runtime "NODE:20-lts"
    Write-Host "✅ BFF criado" -ForegroundColor Green
} else {
    Write-Host "✅ BFF já existe" -ForegroundColor Green
}

# Configurar Startup Commands
Write-Host ""
Write-Host "Configurando Startup Commands..." -ForegroundColor Yellow

az webapp config set `
    --name fincloud-user-service `
    --resource-group $ResourceGroup `
    --startup-file "npm start"

az webapp config set `
    --name fincloud-transaction-service `
    --resource-group $ResourceGroup `
    --startup-file "npm start"

az webapp config set `
    --name fincloud-bff `
    --resource-group $ResourceGroup `
    --startup-file "npm start"

Write-Host "✅ Startup Commands configurados" -ForegroundColor Green

# Configurar SQL Server Firewall
Write-Host ""
Write-Host "Configurando SQL Server Firewall..." -ForegroundColor Yellow

# Permitir serviços Azure
az sql server firewall-rule create `
    --resource-group $ResourceGroup `
    --server fincloud `
    --name AllowAzureServices `
    --start-ip-address 0.0.0.0 `
    --end-ip-address 0.0.0.0 `
    2>$null | Out-Null

Write-Host "✅ Firewall configurado (pode precisar ajustar IPs específicos)" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Recursos criados com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Configure as variáveis de ambiente (veja azure-config.md)" -ForegroundColor White
Write-Host "  2. Execute o deploy: .\deploy-azure.ps1" -ForegroundColor White
Write-Host ""
Write-Host "📝 URLs criadas:" -ForegroundColor Cyan
Write-Host "  User Service: https://fincloud-user-service.azurewebsites.net" -ForegroundColor White
Write-Host "  Transaction Service: https://fincloud-transaction-service.azurewebsites.net" -ForegroundColor White
Write-Host "  BFF: https://fincloud-bff.azurewebsites.net" -ForegroundColor White

