# 🚀 Guia de Deploy - Azure

Este guia explica como fazer deploy de todos os serviços do FinCloud no Azure.

## 📋 Recursos Azure Necessários

Você já possui:
- ✅ **FinApp** - Static Web App (Central US)
- ✅ **FinAdm** - Static Web App (Central US)
- ✅ **SQL Server** (fincloud) - Brazil South
- ✅ **SQL Database** (fincloud) - Brazil South
- ✅ **Function App** (fincloud) - Canada Central
- ✅ **MongoDB Atlas** (fincloud)

### Recursos Adicionais Necessários

Você precisará criar:
1. **App Service** para BFF (ou usar o Function App existente)
2. **App Service** para User Service
3. **App Service** para Transaction Service
4. **Azure Functions** dentro do Function App existente

---

## 🎯 Estratégia de Deploy

### Opção 1: App Services (Recomendado)
- BFF → App Service
- User Service → App Service
- Transaction Service → App Service

### Opção 2: Azure Functions
- BFF → Function App (HTTP trigger)
- User Service → Function App (HTTP trigger)
- Transaction Service → Function App (HTTP trigger)

**Vamos usar a Opção 1 (App Services)** para melhor performance.

---

## 📦 Parte 1: Deploy das Azure Functions

### 1.1 MongoDB Function

```bash
# 1. Instalar Azure Functions Core Tools (se ainda não tiver)
npm install -g azure-functions-core-tools@4 --unsafe-perm true

# 2. Navegar até a função
cd FinCloud/azure-functions/mongodb-function

# 3. Instalar dependências
npm install

# 4. Fazer login no Azure
az login

# 5. Deploy da função
func azure functionapp publish fincloud --javascript
```

**Configurar Variáveis de Ambiente no Azure:**

1. No Portal Azure, vá para **Function App** → **fincloud**
2. Vá em **Configuration** → **Application settings**
3. Adicione:
   ```
   MONGODB_URI=mongodb+srv://seu-usuario:sua-senha@cluster.mongodb.net/
   MONGODB_DATABASE=fincloud
   ```

### 1.2 Azure SQL Function

```bash
# 1. Navegar até a função
cd FinCloud/azure-functions/azuresql-function

# 2. Instalar dependências
npm install

# 3. Deploy da função
func azure functionapp publish fincloud --javascript
```

**Configurar Variáveis de Ambiente:**

No Portal Azure, adicione:
```
AZURE_SQL_SERVER=fincloud.database.windows.net
AZURE_SQL_DATABASE=fincloud
AZURE_SQL_USER=seu-usuario
AZURE_SQL_PASSWORD=sua-senha
```

---

## 🔧 Parte 2: Deploy do User Service

### 2.1 Criar App Service

```bash
# 1. Criar App Service Plan (se não existir)
az appservice plan create \
  --name ASP-FinArq-user \
  --resource-group FinArq \
  --location BrazilSouth \
  --sku B1

# 2. Criar App Service
az webapp create \
  --name fincloud-user-service \
  --resource-group FinArq \
  --plan ASP-FinArq-user \
  --runtime "NODE:20-lts"
```

### 2.2 Configurar Variáveis de Ambiente

No Portal Azure:
1. Vá para **App Service** → **fincloud-user-service**
2. **Configuration** → **Application settings**
3. Adicione:

```env
# Database
DB_SERVER=fincloud.database.windows.net
DB_PORT=1433
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
DB_NAME=fincloud
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=false

# JWT
JWT_SECRET=seu-jwt-secret-super-seguro-aqui

# Server
PORT=3001
NODE_ENV=production

# TypeORM
TYPEORM_SYNC=false
```

### 2.3 Deploy via Git

```bash
# 1. Navegar até o serviço
cd FinCloud/user-service

# 2. Criar arquivo .deployment (se não existir)
echo "[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
" > .deployment

# 3. Criar arquivo .gitignore se necessário
# 4. Commit e push para repositório
# 5. Configurar Deployment Center no Azure Portal
```

**Ou via ZIP Deploy:**

```bash
# 1. Instalar dependências localmente
npm install --production

# 2. Criar ZIP
cd FinCloud/user-service
zip -r deploy.zip . -x "*.git*" "node_modules/.cache/*" "*.test.js"

# 3. Deploy via CLI
az webapp deployment source config-zip \
  --resource-group FinArq \
  --name fincloud-user-service \
  --src deploy.zip
```

### 2.4 Configurar Startup Command

No Portal Azure:
1. **Configuration** → **General settings**
2. **Startup Command**: `npm start`

---

## 🔧 Parte 3: Deploy do Transaction Service

### 3.1 Criar App Service

```bash
# 1. Criar App Service (pode usar o mesmo plan)
az webapp create \
  --name fincloud-transaction-service \
  --resource-group FinArq \
  --plan ASP-FinArq-user \
  --runtime "NODE:20-lts"
```

### 3.2 Configurar Variáveis de Ambiente

```env
# MongoDB
MONGODB_URI=mongodb+srv://seu-usuario:sua-senha@cluster.mongodb.net/
MONGODB_DATABASE=fincloud

# Server
PORT=3002
NODE_ENV=production
```

### 3.3 Deploy

Seguir os mesmos passos do User Service (2.3 e 2.4).

---

## 🔧 Parte 4: Deploy do BFF

### 4.1 Criar App Service

```bash
az webapp create \
  --name fincloud-bff \
  --resource-group FinArq \
  --plan ASP-FinArq-user \
  --runtime "NODE:20-lts"
```

### 4.2 Configurar Variáveis de Ambiente

```env
# Frontend URLs
FRONTEND_URL=https://finapp.azurestaticapps.net
FRONTEND_ADM_URL=https://finadm.azurestaticapps.net

# Services
USER_SERVICE_URL=https://fincloud-user-service.azurewebsites.net
TRANSACTION_SERVICE_URL=https://fincloud-transaction-service.azurewebsites.net

# Azure Functions
AZURE_SQL_FUNCTION_URL=https://fincloud.azurewebsites.net/api/azuresql
MONGODB_FUNCTION_URL=https://fincloud.azurewebsites.net/api/mongodb

# Server
PORT=3000
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=https://finapp.azurestaticapps.net,https://finadm.azurestaticapps.net
```

### 4.3 Deploy

Seguir os mesmos passos (2.3 e 2.4).

---

## 🔧 Parte 5: Configurar Frontends

### 5.1 FinApp (Static Web App)

No Portal Azure, vá para **Static Web App** → **FinApp**:

1. **Configuration** → Adicione variáveis:
```env
VITE_API_URL=https://fincloud-bff.azurewebsites.net/api
```

2. Redeploy o frontend com as novas variáveis

### 5.2 FinAdm (Static Web App)

Mesmo processo para FinAdm:
```env
VITE_API_URL=https://fincloud-bff.azurewebsites.net/api
```

---

## 🔒 Parte 6: Configurar Firewall e Segurança

### 6.1 SQL Server Firewall

```bash
# Permitir acesso do App Service
az sql server firewall-rule create \
  --resource-group FinArq \
  --server fincloud \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Ou permitir IP específico do App Service
az sql server firewall-rule create \
  --resource-group FinArq \
  --server fincloud \
  --name AllowAppService \
  --start-ip-address <IP_DO_APP_SERVICE> \
  --end-ip-address <IP_DO_APP_SERVICE>
```

**No Portal:**
1. SQL Server → **Security** → **Networking**
2. Permitir **Azure services and resources** e adicionar IPs necessários

### 6.2 MongoDB Atlas Whitelist

No MongoDB Atlas:
1. **Network Access** → **Add IP Address**
2. Adicione `0.0.0.0/0` (todos os IPs) ou IPs específicos do Azure

### 6.3 CORS no BFF

Já configurado via variável `ALLOWED_ORIGINS` no BFF.

---

## ✅ Parte 7: Verificação e Testes

### 7.1 Health Checks

```bash
# BFF
curl https://fincloud-bff.azurewebsites.net/api/health

# User Service
curl https://fincloud-user-service.azurewebsites.net/health

# Transaction Service
curl https://fincloud-transaction-service.azurewebsites.net/health
```

### 7.2 Testar Endpoints

```bash
# Testar BFF
curl https://fincloud-bff.azurewebsites.net/api/users

# Testar Azure Functions
curl "https://fincloud.azurewebsites.net/api/mongodb?collection=test"
curl "https://fincloud.azurewebsites.net/api/azuresql?table=users"
```

---

## 📝 Scripts de Deploy Automatizados

### Script PowerShell (Windows)

Crie `deploy-all.ps1`:

```powershell
# Login
az login

# Deploy Functions
Write-Host "Deploying MongoDB Function..."
cd FinCloud/azure-functions/mongodb-function
func azure functionapp publish fincloud --javascript

Write-Host "Deploying Azure SQL Function..."
cd ../azuresql-function
func azure functionapp publish fincloud --javascript

# Deploy Services
Write-Host "Deploying User Service..."
cd ../../user-service
npm install --production
Compress-Archive -Path * -DestinationPath deploy.zip -Force
az webapp deployment source config-zip --resource-group FinArq --name fincloud-user-service --src deploy.zip

Write-Host "Deploying Transaction Service..."
cd ../transaction-service
npm install --production
Compress-Archive -Path * -DestinationPath deploy.zip -Force
az webapp deployment source config-zip --resource-group FinArq --name fincloud-transaction-service --src deploy.zip

Write-Host "Deploying BFF..."
cd ../bff
npm install --production
Compress-Archive -Path * -DestinationPath deploy.zip -Force
az webapp deployment source config-zip --resource-group FinArq --name fincloud-bff --src deploy.zip

Write-Host "Deploy concluído!"
```

---

## 🔍 Troubleshooting

### Erro: "Cannot connect to database"

1. Verifique firewall do SQL Server
2. Verifique variáveis de ambiente
3. Verifique logs do App Service: **Log stream**

### Erro: "CORS policy"

1. Verifique `ALLOWED_ORIGINS` no BFF
2. Verifique URLs dos frontends

### Erro: "Function not found"

1. Verifique se as funções foram deployadas
2. Verifique `function.json` está correto
3. Verifique logs do Function App

### Ver Logs

```bash
# App Service logs
az webapp log tail --name fincloud-user-service --resource-group FinArq

# Function App logs
az functionapp log tail --name fincloud --resource-group FinArq
```

---

## 📊 URLs Finais

Após o deploy, você terá:

- **FinApp**: https://finapp.azurestaticapps.net
- **FinAdm**: https://finadm.azurestaticapps.net
- **BFF**: https://fincloud-bff.azurewebsites.net/api
- **User Service**: https://fincloud-user-service.azurewebsites.net
- **Transaction Service**: https://fincloud-transaction-service.azurewebsites.net
- **Azure Functions**: https://fincloud.azurewebsites.net/api

---

## 🔐 Segurança Adicional

### 1. Habilitar HTTPS

Todos os App Services já têm HTTPS por padrão.

### 2. Authentication no Azure

No Portal Azure, você pode habilitar autenticação:
- **App Service** → **Authentication**
- Configure Azure AD ou outro provider

### 3. Application Insights

Já configurado automaticamente com o Application Insights existente.

---

## 📚 Próximos Passos

1. ✅ Configurar backup automático do SQL Database
2. ✅ Configurar alertas no Application Insights
3. ✅ Configurar CI/CD via GitHub Actions ou Azure DevOps
4. ✅ Configurar staging slots para testes

---

**Última atualização**: Dezembro 2024

