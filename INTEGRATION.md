# 🔗 Guia de Integração Completa - FinCloud

## 📋 Visão Geral

Este documento explica como integrar completamente os frontends **FinAdmPrototype** (Admin) e **FinAppPrototype** (Cliente) com o **BFF** (Backend for Frontend) e os microserviços de **Usuários** e **Transações**.

## 🏗️ Arquitetura

```
┌─────────────────────┐         ┌─────────────────────┐
│  FinAdmPrototype    │         │  FinAppPrototype    │
│  (Admin Frontend)   │         │  (Client Frontend)  │
│  Port: 5174         │         │  Port: 5173         │
└──────────┬──────────┘         └──────────┬──────────┘
           │                               │
           │         HTTP/REST             │
           └───────────────┬───────────────┘
                          │
                ┌─────────▼──────────┐
                │       BFF          │
                │  (API Gateway)     │
                │  Port: 3000        │
                └─────────┬──────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
┌─────────▼──────────┐   │   ┌───────────▼────────────┐
│  User Service      │   │   │ Transaction Service    │
│  Port: 3001        │   │   │ Port: 3002             │
└─────────┬──────────┘   │   └───────────┬────────────┘
          │              │               │
┌─────────▼──────────┐   │   ┌───────────▼────────────┐
│  MongoDB           │   │   │  SQL Server            │
│  Port: 27017       │   │   │  Port: 1433            │
└────────────────────┘   │   └────────────────────────┘
                         │
                ┌────────▼─────────┐
                │ Azure Functions  │
                │ (Optional)       │
                └──────────────────┘
```

## 🚀 Setup Completo

### 1. Pré-requisitos

- **Node.js**: v20.x ou superior
- **npm**: v9.x ou superior
- **Docker** e **Docker Compose** (para os bancos de dados)
- **Git**

### 2. Clonar e Instalar Dependências

```powershell
# Navegar para o diretório do projeto
cd C:\Users\Victor\Desktop\CloudAll

# Instalar dependências do BFF
cd FinCloud\bff
npm install

# Instalar dependências do User Service
cd ..\user-service
npm install

# Instalar dependências do Transaction Service
cd ..\transaction-service
npm install

# Instalar dependências do FinAdmPrototype
cd ..\..\FinAdmPrototype
npm install

# Instalar dependências do FinAppPrototype
cd ..\FinAppPrototype
npm install
```

### 3. Configurar Variáveis de Ambiente

#### 3.1 BFF (Backend for Frontend)

Arquivo: `FinCloud/bff/.env`

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
USER_SERVICE_URL=http://localhost:3001
TRANSACTION_SERVICE_URL=http://localhost:3002

# Azure Functions (Opcional)
MONGODB_FUNCTION_URL=http://localhost:7071/api/mongodb-function
AZURESQL_FUNCTION_URL=http://localhost:7072/api/azuresql-function
AZURE_FUNCTION_KEY=your_function_key_here
```

#### 3.2 User Service

Arquivo: `FinCloud/user-service/.env`

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fin_users
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

#### 3.3 Transaction Service

Arquivo: `FinCloud/transaction-service/.env`

```env
PORT=3002
NODE_ENV=development
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=YourStrong@Passw0rd
DB_NAME=fin_transactions
```

#### 3.4 FinAdmPrototype (Admin Frontend)

Arquivo: `FinAdmPrototype/.env`

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_BFF_URL=http://localhost:3000

# Environment
VITE_NODE_ENV=development
```

#### 3.5 FinAppPrototype (Client Frontend)

Arquivo: `FinAppPrototype/.env`

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_BFF_URL=http://localhost:3000

# Environment
VITE_NODE_ENV=development
```

### 4. Iniciar os Bancos de Dados

```powershell
# Navegar para o diretório do FinCloud
cd C:\Users\Victor\Desktop\CloudAll\FinCloud

# Iniciar MongoDB e SQL Server com Docker Compose
docker-compose up -d
```

Verificar se os containers estão rodando:

```powershell
docker ps
```

### 5. Iniciar os Serviços (em ordem)

#### 5.1 Iniciar o User Service

```powershell
cd C:\Users\Victor\Desktop\CloudAll\FinCloud\user-service
npm run dev
```

#### 5.2 Iniciar o Transaction Service

```powershell
cd C:\Users\Victor\Desktop\CloudAll\FinCloud\transaction-service
npm run dev
```

#### 5.3 Iniciar o BFF

```powershell
cd C:\Users\Victor\Desktop\CloudAll\FinCloud\bff
npm run dev
```

#### 5.4 Iniciar o FinAdmPrototype

```powershell
cd C:\Users\Victor\Desktop\CloudAll\FinAdmPrototype
npm run dev
```

#### 5.5 Iniciar o FinAppPrototype

```powershell
cd C:\Users\Victor\Desktop\CloudAll\FinAppPrototype
npm run dev
```

### 6. Verificar Integrações

Acesse os seguintes URLs para verificar se tudo está funcionando:

- **BFF Health Check**: http://localhost:3000/api/health
- **User Service**: http://localhost:3001/api/health
- **Transaction Service**: http://localhost:3002/api/health
- **FinAdmPrototype**: http://localhost:5174
- **FinAppPrototype**: http://localhost:5173

## 📡 Endpoints da API

### Usuários (via BFF)

#### Endpoints Públicos
- `POST /api/users/register` - Registrar novo usuário
- `POST /api/users/login` - Login

#### Endpoints Protegidos
- `GET /api/users` - Listar todos os usuários (Admin)
- `GET /api/users/:id` - Buscar usuário por ID
- `POST /api/users` - Criar usuário (Admin)
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário (Admin)
- `GET /api/users/profile/:id` - Buscar perfil do usuário
- `PUT /api/users/profile/:id` - Atualizar perfil

### Transações (via BFF)

- `GET /api/transactions` - Listar todas as transações (Admin)
- `GET /api/transactions/user/:userId` - Buscar transações do usuário
- `POST /api/transactions` - Criar nova transação
- `PUT /api/transactions/:id` - Atualizar transação
- `DELETE /api/transactions/:id` - Deletar transação
- `GET /api/transactions/user/:userId/summary` - Resumo financeiro do usuário
- `GET /api/transactions/user/:userId/categories` - Transações por categoria

## 🔧 Estrutura dos Serviços de API

### FinAdmPrototype - `src/services/api.ts`

```typescript
import { apiService } from '@/services/api';

// Exemplo de uso
const users = await apiService.getAllUsers();
const transaction = await apiService.createTransaction({
  userId: '123',
  amount: 100.50,
  description: 'Salário',
  category: 'salary',
  type: 'income',
  date: '2024-10-27'
});
```

### FinAppPrototype - `src/services/api.ts`

```typescript
import { apiService } from '@/services/api';

// Exemplo de uso
const response = await apiService.loginUser({
  email: 'user@example.com',
  password: 'senha123'
});

if (response.data) {
  // Login bem-sucedido
  console.log('Token:', response.data.token);
  console.log('User:', response.data.user);
}
```

## 🔐 Autenticação

### Fluxo de Autenticação

1. O usuário faz login via `POST /api/users/login`
2. O BFF encaminha a requisição para o User Service
3. O User Service valida as credenciais e retorna um JWT
4. O JWT é armazenado no `localStorage` do frontend
5. Todas as requisições subsequentes incluem o JWT no header `Authorization: Bearer <token>`

### Implementação no Frontend

```typescript
// Login
const response = await apiService.loginUser({
  email: 'admin@example.com',
  password: 'admin123'
});

if (response.data?.token) {
  // Token automaticamente salvo no localStorage
  // Redirecionar para dashboard
}

// Logout
apiService.logout(); // Remove token e redireciona para login
```

## 🎨 Componentes Integrados

### FinAdmPrototype (Admin)

#### UserManagement.tsx
- Listar todos os usuários
- Criar novo usuário
- Editar usuário existente
- Deletar usuário
- Buscar/filtrar usuários

#### Dashboard.tsx
- Exibir estatísticas gerais
- Gráficos de crescimento
- Logins por semana
- Distribuição de usuários

#### Statistics.tsx
- Resumo financeiro global
- Transações por categoria
- Métricas de usuários

### FinAppPrototype (Cliente)

#### Login.tsx
- Formulário de login
- Validação de credenciais
- Armazenamento de token

#### CreateAccount.tsx
- Registro de novo usuário
- Validação de campos
- Integração com API

#### Dashboard.tsx
- Resumo financeiro pessoal
- Transações recentes
- Metas financeiras

#### TransactionRegistration.tsx
- Criar nova transação
- Listar transações do usuário
- Editar/deletar transações
- Filtrar por categoria

## 🐛 Depuração

### Logs do BFF

O BFF loga todas as requisições recebidas e redirecionadas:

```
🌐 API Request: POST /api/users/login
✅ API Response: /api/users/login { token: '...', user: {...} }
```

### Logs do Frontend

Os serviços de API logam todas as chamadas:

```
🌐 API Request: GET /api/users
✅ API Response: /api/users [{ id: '1', name: 'João' }, ...]
```

### Erros Comuns

#### 1. Erro de CORS
**Problema**: `Access to fetch at 'http://localhost:3000/api/users' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solução**: Verificar se o `FRONTEND_URL` está configurado corretamente no `.env` do BFF.

#### 2. Erro 503 Service Unavailable
**Problema**: O BFF não consegue se conectar aos microserviços.

**Solução**: Verificar se os serviços estão rodando e se as URLs estão corretas no `.env` do BFF.

#### 3. Erro 401 Unauthorized
**Problema**: Token inválido ou expirado.

**Solução**: Fazer login novamente para obter um novo token.

## 📊 Monitoramento

### Health Checks

Todos os serviços expõem um endpoint de health check:

```powershell
# Verificar BFF
curl http://localhost:3000/api/health

# Verificar User Service
curl http://localhost:3001/api/health

# Verificar Transaction Service
curl http://localhost:3002/api/health
```

## 🚢 Deploy (Produção)

### Variáveis de Ambiente de Produção

#### BFF
```env
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://finadmin.yourdomain.com,https://finapp.yourdomain.com
USER_SERVICE_URL=https://user-service.yourdomain.com
TRANSACTION_SERVICE_URL=https://transaction-service.yourdomain.com
```

#### Frontends
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_NODE_ENV=production
```

### Build dos Frontends

```powershell
# FinAdmPrototype
cd FinAdmPrototype
npm run build

# FinAppPrototype
cd ../FinAppPrototype
npm run build
```

Os arquivos de build estarão em `dist/` em cada projeto.

## 📚 Recursos Adicionais

- **Documentação da API**: http://localhost:3000/api/docs (Swagger UI)
- **OpenAPI Spec**: http://localhost:3000/api/openapi.json

## 🤝 Contribuindo

Para contribuir com o projeto:

1. Faça suas alterações
2. Teste localmente seguindo este guia
3. Verifique se todos os serviços estão funcionando
4. Commit e push das alterações

## ❓ Suporte

Para problemas ou dúvidas:

1. Verifique os logs de cada serviço
2. Consulte a seção de Depuração
3. Verifique se todas as variáveis de ambiente estão configuradas
4. Certifique-se de que os bancos de dados estão rodando

---

**Última atualização**: Outubro 2025  
**Versão**: 1.0.0
