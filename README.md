# 💰 FinCloud - Sistema de Gestão Financeira

Sistema completo de gestão financeira com arquitetura de microserviços, incluindo painel administrativo e aplicação cliente.

## 🏗️ Arquitetura

### Arquitetura Geral

```
FinCloud/
├── bff/                      # Backend for Frontend (API Gateway)
├── user-service/             # Microserviço de Usuários (Clean Architecture)
├── transaction-service/      # Microserviço de Transações (Clean Architecture)
├── azure-functions/          # Azure Functions (Opcional)
├── FinAdmPrototype/         # Frontend Administrativo (React + TypeScript)
├── FinAppPrototype/         # Frontend Cliente (React + TypeScript)
└── docs/                    # Documentação
```

### Clean Architecture

Os microserviços (`user-service` e `transaction-service`) seguem os princípios da **Clean Architecture**, organizando o código em camadas bem definidas:

```
microservice/
├── domain/                   # Camada de Domínio (Núcleo)
│   ├── entities/            # Entidades de negócio puras
│   └── repositories/        # Interfaces de repositórios
│
├── application/              # Camada de Aplicação
│   └── features/            # Features organizadas por Vertical Slice
│       ├── register-user/
│       │   └── RegisterUserUseCase.js
│       ├── login-user/
│       │   └── LoginUserUseCase.js
│       └── create-transaction/
│           └── CreateTransactionUseCase.js
│
├── infrastructure/           # Camada de Infraestrutura
│   └── repositories/        # Implementações concretas (TypeORM/MongoDB)
│
└── presentation/            # Camada de Apresentação
    └── controllers/         # Controllers HTTP
```

#### Regras de Dependência

A Clean Architecture garante que:

1. **Domain Layer** (Núcleo)
   - Não depende de nenhuma outra camada
   - Contém apenas regras de negócio puras
   - Entidades e interfaces de repositórios

2. **Application Layer** (Casos de Uso)
   - Depende apenas de Domain
   - Implementa a lógica de negócio dos casos de uso
   - Não conhece detalhes de infraestrutura

3. **Infrastructure Layer** (Detalhes)
   - Implementa interfaces definidas em Domain
   - Acessa bancos de dados, APIs externas, etc.
   - Pode depender de Application para uso de casos de uso

4. **Presentation Layer** (Interface)
   - Controllers HTTP, rotas
   - Depende de Application (use cases)
   - Não conhece detalhes de infraestrutura

#### Benefícios

- ✅ **Testabilidade**: Lógica de negócio isolada e fácil de testar
- ✅ **Independência**: Domain não muda quando mudamos frameworks ou bancos
- ✅ **Manutenibilidade**: Código organizado e fácil de entender
- ✅ **Flexibilidade**: Troca de tecnologias sem afetar o core

### Vertical Slice Architecture

Além da Clean Architecture, o projeto também utiliza **Vertical Slice** para organizar features:

```
application/features/
├── register-user/           # Feature completa de registro
│   └── RegisterUserUseCase.js
│
├── login-user/              # Feature completa de login
│   └── LoginUserUseCase.js
│
└── create-transaction/      # Feature completa de criação
    └── CreateTransactionUseCase.js
```

#### Princípios do Vertical Slice

- Cada feature é auto-contida (use case próprio)
- Features não dependem de outras features
- Facilita adicionar novas funcionalidades
- Reduz acoplamento entre diferentes partes do sistema

### Diagrama de Camadas

```
┌─────────────────────────────────────────┐
│      Presentation (HTTP/Routes)         │
│  ┌───────────────────────────────────┐  │
│  │    Application (Use Cases)        │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   Domain (Entities/Rules)   │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Infrastructure (DB/External)     │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Setas de dependência**: As camadas externas dependem das internas, mas nunca o contrário.

## ✨ Funcionalidades

### 👨‍💼 Painel Administrativo (FinAdmPrototype)
- ✅ Gerenciamento completo de usuários (CRUD)
- ✅ Visualização de estatísticas gerais
- ✅ Dashboard com gráficos e métricas
- ✅ Controle de permissões
- ✅ Relatórios financeiros globais

### 📱 Aplicação Cliente (FinAppPrototype)
- ✅ Registro e autenticação de usuários
- ✅ Dashboard pessoal com resumo financeiro
- ✅ Registro de transações (receitas e despesas)
- ✅ Categorização de transações
- ✅ Metas financeiras
- ✅ Relatórios personalizados

### 🔧 Backend (Microserviços)
- ✅ Arquitetura de microserviços
- ✅ BFF (Backend for Frontend) como API Gateway
- ✅ Autenticação JWT
- ✅ Rate limiting e segurança
- ✅ Logs e monitoramento
- ✅ Documentação OpenAPI/Swagger

## 🚀 Quick Start

### Desenvolvimento Local

#### Opção 1: Setup Automático (Recomendado)

```powershell
# Clone o repositório
git clone <seu-repositorio>
cd CloudAll

# Execute o setup
.\setup.ps1

# Inicie todos os serviços
.\start-all.ps1
```

#### Opção 2: Setup Manual

Siga as instruções detalhadas no arquivo [INTEGRATION.md](./INTEGRATION.md)

### 🌐 Deploy no Azure

Para fazer deploy de todos os serviços no Azure:

1. **Criar recursos Azure:**
```powershell
cd FinCloud
.\create-azure-resources.ps1
```

2. **Configurar variáveis de ambiente:**
   - Veja o guia completo: [azure-config.md](./FinCloud/azure-config.md)
   - Configure todas as variáveis no Portal Azure

3. **Fazer deploy:**
```powershell
cd FinCloud
.\deploy-azure.ps1
```

📖 **Guia completo de deploy:** [DEPLOY_AZURE.md](./DEPLOY_AZURE.md)

## 📋 Pré-requisitos

- **Node.js** v20.x ou superior
- **npm** v9.x ou superior
- **Docker** e **Docker Compose**
- **Git**

## 🔗 URLs dos Serviços

| Serviço | URL | Porta |
|---------|-----|-------|
| **Admin Frontend** | http://localhost:5174 | 5174 |
| **Client Frontend** | http://localhost:5173 | 5173 |
| **BFF API** | http://localhost:3000/api | 3000 |
| **API Docs (Swagger)** | http://localhost:3000/api/docs | 3000 |
| **User Service** | http://localhost:3001 | 3001 |
| **Transaction Service** | http://localhost:3002 | 3002 |
| **MongoDB** | mongodb://localhost:27017 | 27017 |
| **SQL Server** | localhost:1433 | 1433 |

## 📁 Estrutura de Diretórios

```
CloudAll/
│
├── FinCloud/                          # Backend Services
│   ├── bff/                          # Backend for Frontend
│   │   ├── src/
│   │   │   ├── routes/              # Rotas da API
│   │   │   ├── server.js            # Servidor Express
│   │   │   └── openapi.json         # Especificação OpenAPI
│   │   ├── package.json
│   │   └── .env.example
│   │
│   ├── user-service/                 # Serviço de Usuários
│   │   ├── src/
│   │   │   ├── entities/            # Modelos MongoDB
│   │   │   ├── routes/              # Rotas do serviço
│   │   │   └── server.js
│   │   └── package.json
│   │
│   ├── transaction-service/          # Serviço de Transações
│   │   ├── src/
│   │   │   ├── entities/            # Modelos SQL Server
│   │   │   ├── routes/              # Rotas do serviço
│   │   │   └── server.js
│   │   └── package.json
│   │
│   ├── docker-compose.yml            # Configuração Docker
│   └── docs/                         # Documentação técnica
│
├── FinAdmPrototype/                   # Frontend Admin
│   ├── src/
│   │   ├── components/               # Componentes React
│   │   │   ├── UserManagement.tsx   # Gerenciar usuários
│   │   │   ├── Dashboard.tsx        # Dashboard admin
│   │   │   └── Statistics.tsx       # Estatísticas
│   │   ├── services/
│   │   │   └── api.ts               # Cliente API
│   │   ├── contexts/                # Contexts React
│   │   └── App.tsx
│   ├── package.json
│   └── .env.example
│
├── FinAppPrototype/                   # Frontend Cliente
│   ├── src/
│   │   ├── components/               # Componentes React
│   │   │   ├── Login.tsx            # Login
│   │   │   ├── CreateAccount.tsx    # Registro
│   │   │   ├── Dashboard.tsx        # Dashboard cliente
│   │   │   └── TransactionRegistration.tsx
│   │   ├── services/
│   │   │   └── api.ts               # Cliente API
│   │   ├── contexts/                # Contexts React
│   │   └── App.tsx
│   ├── package.json
│   └── .env.example
│
├── INTEGRATION.md                     # Guia de Integração Completa
├── README.md                          # Este arquivo
├── setup.ps1                          # Script de setup
└── start-all.ps1                      # Script para iniciar tudo
```

## 🔐 Autenticação

O sistema utiliza **JWT (JSON Web Tokens)** para autenticação:

1. Usuário faz login via frontend
2. BFF encaminha para o User Service
3. User Service valida e retorna JWT
4. JWT é armazenado no localStorage
5. Todas as requisições incluem o JWT no header `Authorization`

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React** 18.x
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Radix UI**
- **Axios**
- **React Query** (para cache e estado)
- **Recharts** (gráficos)
- **Sonner** (toasts)

### Backend
- **Node.js** 20.x
- **Express.js**
- **MongoDB** (usuários)
- **SQL Server** (transações)
- **JWT** (autenticação)
- **Helmet** (segurança)
- **Rate Limit** (proteção)
- **Morgan** (logs)
- **Swagger UI** (documentação)

### DevOps
- **Docker** & **Docker Compose**
- **Git**

## 📊 API Endpoints

### Usuários
```
POST   /api/users/register          # Registrar usuário
POST   /api/users/login              # Login
GET    /api/users                    # Listar usuários (Admin)
GET    /api/users/:id                # Buscar usuário
POST   /api/users                    # Criar usuário (Admin)
PUT    /api/users/:id                # Atualizar usuário
DELETE /api/users/:id                # Deletar usuário
```

### Transações
```
GET    /api/transactions             # Listar todas (Admin)
GET    /api/transactions/user/:userId  # Listar por usuário
POST   /api/transactions             # Criar transação
PUT    /api/transactions/:id         # Atualizar transação
DELETE /api/transactions/:id         # Deletar transação
GET    /api/transactions/user/:userId/summary  # Resumo financeiro
```

### Health Check
```
GET    /api/health                   # Status da API
```

## 🧪 Testes

### Testes de Arquitetura

Os microserviços incluem testes de arquitetura que validam as regras de dependência da Clean Architecture:

```powershell
# Testar arquitetura do User Service
cd FinCloud\user-service
npm test -- architecture.test.js

# Testar arquitetura do Transaction Service
cd FinCloud\transaction-service
npm test -- architecture.test.js
```

Os testes verificam:
- ✅ Domain não depende de outras camadas
- ✅ Application só depende de Domain
- ✅ Infrastructure não depende de Presentation
- ✅ Vertical Slice está corretamente organizado

### Testes Unitários

```powershell
# Testar BFF
cd FinCloud\bff
npm test

# Testar User Service
cd FinCloud\user-service
npm test

# Testar Transaction Service
cd FinCloud\transaction-service
npm test
```

## 📝 Variáveis de Ambiente

Todos os serviços possuem arquivos `.env.example` que devem ser copiados para `.env` e configurados:

- **BFF**: `FinCloud/bff/.env`
- **User Service**: `FinCloud/user-service/.env`
- **Transaction Service**: `FinCloud/transaction-service/.env`
- **FinAdmPrototype**: `FinAdmPrototype/.env`
- **FinAppPrototype**: `FinAppPrototype/.env`

## 🐛 Troubleshooting

### Porta já em uso
```powershell
# Verificar processos nas portas
netstat -ano | findstr :<porta>

# Matar processo
taskkill /PID <pid> /F
```

### Docker não inicia
```powershell
# Verificar status do Docker
docker ps

# Reiniciar containers
docker-compose down
docker-compose up -d
```

### Erro de dependências
```powershell
# Limpar cache e reinstalar
rm -r node_modules
rm package-lock.json
npm install
```

## 📚 Documentação Adicional

- [Guia de Integração Completa](./INTEGRATION.md)
- [Documentação do Projeto](./FinCloud/docs/PROJECT_OVERVIEW.md)
- [Diagramas de Arquitetura](./FinCloud/docs/diagrams/)
- [API Reference (Swagger)](http://localhost:3000/api/docs)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Autores

- **Victor** - Desenvolvimento inicial

### Alunos do Projeto

Este projeto foi desenvolvido como parte de um trabalho acadêmico aplicando conceitos de:
- **Clean Architecture**: Separação de responsabilidades e independência de frameworks
- **Vertical Slice Architecture**: Organização por features
- **Microservices**: Arquitetura distribuída
- **Test-Driven Development**: Testes de arquitetura e validação de dependências

## 🙏 Agradecimentos

- Comunidade React
- Comunidade Node.js
- Contributors do projeto

---

**Para começar agora, execute:**

```powershell
.\setup.ps1 && .\start-all.ps1
```

🚀 **Happy Coding!**
