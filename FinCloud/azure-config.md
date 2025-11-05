# ⚙️ Configuração de Variáveis de Ambiente - Azure

## 📋 Checklist de Configuração

### ✅ 1. Function App (fincloud)

**Portal:** Function App → fincloud → Configuration → Application settings

```env
# MongoDB
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/
MONGODB_DATABASE=fincloud

# Azure SQL
AZURE_SQL_SERVER=fincloud.database.windows.net
AZURE_SQL_DATABASE=fincloud
AZURE_SQL_USER=seu-usuario
AZURE_SQL_PASSWORD=sua-senha

# Ambiente
NODE_ENV=production
```

---

### ✅ 2. User Service (fincloud-user-service)

**Portal:** App Service → fincloud-user-service → Configuration → Application settings

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
JWT_SECRET=seu-jwt-secret-super-seguro-aqui-mude-este-valor

# Server
PORT=3001
NODE_ENV=production

# TypeORM
TYPEORM_SYNC=false
```

**Startup Command:** `npm start`

---

### ✅ 3. Transaction Service (fincloud-transaction-service)

**Portal:** App Service → fincloud-transaction-service → Configuration → Application settings

```env
# MongoDB
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/
MONGODB_DATABASE=fincloud

# Server
PORT=3002
NODE_ENV=production
```

**Startup Command:** `npm start`

---

### ✅ 4. BFF (fincloud-bff)

**Portal:** App Service → fincloud-bff → Configuration → Application settings

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
ALLOWED_ORIGINS=https://finapp.azurestaticapps.net,https://finadm.azurestaticapps.net,http://localhost:5173,http://localhost:5174
```

**Startup Command:** `npm start`

---

### ✅ 5. Static Web App - FinApp

**Portal:** Static Web App → FinApp → Configuration → Application settings

```env
VITE_API_URL=https://fincloud-bff.azurewebsites.net/api
```

---

### ✅ 6. Static Web App - FinAdm

**Portal:** Static Web App → FinAdm → Configuration → Application settings

```env
VITE_API_URL=https://fincloud-bff.azurewebsites.net/api
```

---

## 🔐 Como Configurar via CLI

### Function App

```bash
az functionapp config appsettings set \
  --name fincloud \
  --resource-group FinArq \
  --settings \
    MONGODB_URI="mongodb+srv://..." \
    MONGODB_DATABASE="fincloud" \
    AZURE_SQL_SERVER="fincloud.database.windows.net" \
    AZURE_SQL_DATABASE="fincloud" \
    AZURE_SQL_USER="usuario" \
    AZURE_SQL_PASSWORD="senha"
```

### User Service

```bash
az webapp config appsettings set \
  --name fincloud-user-service \
  --resource-group FinArq \
  --settings \
    DB_SERVER="fincloud.database.windows.net" \
    DB_PORT="1433" \
    DB_USER="usuario" \
    DB_PASSWORD="senha" \
    DB_NAME="fincloud" \
    DB_ENCRYPT="true" \
    JWT_SECRET="seu-secret" \
    PORT="3001" \
    NODE_ENV="production"
```

### Transaction Service

```bash
az webapp config appsettings set \
  --name fincloud-transaction-service \
  --resource-group FinArq \
  --settings \
    MONGODB_URI="mongodb+srv://..." \
    MONGODB_DATABASE="fincloud" \
    PORT="3002" \
    NODE_ENV="production"
```

### BFF

```bash
az webapp config appsettings set \
  --name fincloud-bff \
  --resource-group FinArq \
  --settings \
    FRONTEND_URL="https://finapp.azurestaticapps.net" \
    FRONTEND_ADM_URL="https://finadm.azurestaticapps.net" \
    USER_SERVICE_URL="https://fincloud-user-service.azurewebsites.net" \
    TRANSACTION_SERVICE_URL="https://fincloud-transaction-service.azurewebsites.net" \
    AZURE_SQL_FUNCTION_URL="https://fincloud.azurewebsites.net/api/azuresql" \
    MONGODB_FUNCTION_URL="https://fincloud.azurewebsites.net/api/mongodb" \
    PORT="3000" \
    NODE_ENV="production" \
    ALLOWED_ORIGINS="https://finapp.azurestaticapps.net,https://finadm.azurestaticapps.net"
```

---

## 🔒 Segurança

### Gerar JWT Secret Seguro

```bash
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Bash
openssl rand -base64 32
```

### Usar Azure Key Vault (Recomendado)

1. Criar Key Vault
2. Adicionar secrets
3. Referenciar no App Service

---

## ✅ Verificação

Após configurar, teste:

```bash
# Health Check BFF
curl https://fincloud-bff.azurewebsites.net/api/health

# Health Check User Service
curl https://fincloud-user-service.azurewebsites.net/health

# Health Check Transaction Service
curl https://fincloud-transaction-service.azurewebsites.net/health
```

---

**Última atualização**: Dezembro 2024

