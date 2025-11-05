# 🏗️ Arquitetura do Projeto FinCloud

## 📋 Sumário

1. [Visão Geral](#visão-geral)
2. [Clean Architecture](#clean-architecture)
3. [Vertical Slice Architecture](#vertical-slice-architecture)
4. [Microserviços](#microserviços)
5. [Azure Functions](#azure-functions)
6. [Estrutura de Diretórios](#estrutura-de-diretórios)
7. [Regras de Dependência](#regras-de-dependência)
8. [Testes de Arquitetura](#testes-de-arquitetura)
9. [Diagramas](#diagramas)
10. [Decisões Arquiteturais](#decisões-arquiteturais)

---

## 🎯 Visão Geral

O **FinCloud** é um sistema de gestão financeira construído com uma arquitetura de microserviços, seguindo os princípios de **Clean Architecture** e **Vertical Slice Architecture**. O projeto foi desenvolvido para ser escalável, testável e manutenível.

### Tecnologias Principais

- **Backend**: Node.js + Express.js
- **Bancos de Dados**: MongoDB (transações) + Azure SQL (usuários)
- **Frontend**: React + TypeScript + Vite
- **Infraestrutura**: Docker + Azure Functions
- **Autenticação**: JWT
- **API Gateway**: BFF (Backend for Frontend)

---

## 🧹 Clean Architecture

### Conceito

A **Clean Architecture** (Arquitetura Limpa) foi proposta por Robert C. Martin (Uncle Bob) e visa separar o código em camadas concêntricas, onde:

- As camadas internas não conhecem as externas
- As dependências apontam sempre para o centro
- O domínio (core) é independente de frameworks e tecnologias

### Camadas do Projeto

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                      │
│  (HTTP Controllers, Routes, Request/Response DTOs)      │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │            Application Layer                        │ │
│  │  (Use Cases, Business Logic, Feature Handlers)     │ │
│  │                                                      │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │          Domain Layer (CORE)                  │  │ │
│  │  │  (Entities, Value Objects, Business Rules)   │  │ │
│  │  │                                              │  │ │
│  │  │  ┌────────────────────────────────────────┐ │  │ │
│  │  │  │     Infrastructure Layer                │ │  │ │
│  │  │  │  (Repositories, DB, External APIs)     │ │  │ │
│  │  │  └────────────────────────────────────────┘ │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 1. Domain Layer (Núcleo)

**Responsabilidade**: Contém as regras de negócio puras e as entidades do domínio.

**Características**:
- ✅ Não depende de nenhuma outra camada
- ✅ Não conhece frameworks ou bibliotecas externas
- ✅ Contém apenas lógica de negócio
- ✅ Pode ser testado sem infraestrutura

**Exemplo**:
```javascript
// domain/entities/User.js
class User {
  constructor(id, email, name) {
    this.id = id;
    this.email = email;
    this.name = name;
  }

  canLogin() {
    return this.isActive;
  }

  isValid() {
    return this.email && this.email.includes('@');
  }
}
```

**Estrutura**:
```
domain/
├── entities/              # Entidades de negócio
│   ├── User.js
│   └── Transaction.js
└── repositories/          # Interfaces de repositórios
    ├── IUserRepository.js
    └── ITransactionRepository.js
```

### 2. Application Layer (Casos de Uso)

**Responsabilidade**: Orquestra a lógica de negócio para realizar operações específicas.

**Características**:
- ✅ Depende apenas de Domain
- ✅ Implementa casos de uso (use cases)
- ✅ Não conhece detalhes de infraestrutura
- ✅ Pode ser testado com mocks

**Exemplo**:
```javascript
// application/features/register-user/RegisterUserUseCase.js
class RegisterUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userData) {
    // Lógica de negócio
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    // Criação do usuário
    return await this.userRepository.save(userData);
  }
}
```

**Estrutura**:
```
application/
└── features/              # Organização por Vertical Slice
    ├── register-user/
    │   └── RegisterUserUseCase.js
    ├── login-user/
    │   └── LoginUserUseCase.js
    └── create-transaction/
        └── CreateTransactionUseCase.js
```

### 3. Infrastructure Layer (Detalhes)

**Responsabilidade**: Implementa as interfaces definidas em Domain e fornece acesso a recursos externos.

**Características**:
- ✅ Implementa interfaces de Domain
- ✅ Conhece frameworks e tecnologias (TypeORM, MongoDB, etc.)
- ✅ Pode depender de Application para casos de uso
- ✅ Isola o código de acesso a dados

**Exemplo**:
```javascript
// infrastructure/repositories/UserRepository.js
class UserRepository extends IUserRepository {
  async findById(id) {
    const repo = getUserRepository(); // TypeORM
    return await repo.findOne({ where: { id } });
  }

  async save(userData) {
    const repo = getUserRepository();
    const user = repo.create(userData);
    return await repo.save(user);
  }
}
```

**Estrutura**:
```
infrastructure/
└── repositories/          # Implementações concretas
    ├── UserRepository.js
    └── TransactionRepository.js
```

### 4. Presentation Layer (Interface)

**Responsabilidade**: Lida com a comunicação HTTP e delega para os casos de uso.

**Características**:
- ✅ Controllers HTTP
- ✅ Validação de entrada
- ✅ Formatação de resposta
- ✅ Depende de Application (use cases)

**Exemplo**:
```javascript
// presentation/controllers/UserController.js
class UserController {
  constructor() {
    this.registerUseCase = new RegisterUserUseCase(userRepository);
  }

  async register(req, res) {
    try {
      const result = await this.registerUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
```

**Estrutura**:
```
presentation/
└── controllers/           # Controllers HTTP
    └── UserController.js
```

---

## 🍰 Vertical Slice Architecture

### Conceito

O **Vertical Slice** organiza o código por **features** (funcionalidades) ao invés de por camadas técnicas. Cada feature é auto-contida e inclui tudo que precisa para funcionar.

### Benefícios

- ✅ **Baixo acoplamento**: Features não dependem de outras features
- ✅ **Alta coesão**: Tudo relacionado a uma feature está junto
- ✅ **Facilita adição**: Novas features são fáceis de adicionar
- ✅ **Facilita testes**: Cada feature pode ser testada isoladamente

### Estrutura no Projeto

```
application/features/
├── register-user/              # Feature completa de registro
│   └── RegisterUserUseCase.js
│
├── login-user/                 # Feature completa de login
│   └── LoginUserUseCase.js
│
├── create-transaction/         # Feature completa de criação
│   └── CreateTransactionUseCase.js
│
└── update-transaction/         # Feature completa de atualização
    └── UpdateTransactionUseCase.js
```

### Exemplo de Feature Completa

```
register-user/
├── RegisterUserUseCase.js      # Caso de uso
├── RegisterUserDTO.js          # Data Transfer Object (opcional)
├── RegisterUserValidator.js    # Validação (opcional)
└── RegisterUserHandler.js      # Handler HTTP (opcional)
```

---

## 🔄 Microserviços

### Arquitetura de Microserviços

O projeto segue uma arquitetura de microserviços com:

1. **BFF (Backend for Frontend)**: API Gateway que orquestra os serviços
2. **User Service**: Gerencia usuários e autenticação
3. **Transaction Service**: Gerencia transações financeiras
4. **Azure Functions**: Funções serverless para operações específicas

### Comunicação entre Serviços

```
Frontend (React)
    ↓
BFF (API Gateway)
    ↓
    ├──→ User Service (Azure SQL)
    └──→ Transaction Service (MongoDB)
```

### BFF (Backend for Frontend)

**Responsabilidade**: 
- Proxies requests para os microserviços
- Gerencia autenticação JWT
- Rate limiting e segurança
- Validação de entrada

**Arquitetura**:
```
bff/
├── src/
│   ├── server.js              # Servidor Express
│   ├── routes/
│   │   ├── userRoutes.js      # Proxy para User Service
│   │   ├── transactionRoutes.js # Proxy para Transaction Service
│   │   └── azuresqlRoutes.js  # Proxy para Azure Functions
│   └── openapi.json           # Documentação OpenAPI
```

### User Service

**Responsabilidade**: 
- Gerenciamento de usuários
- Autenticação e autorização
- Perfis de usuário

**Banco de Dados**: Azure SQL Server

**Arquitetura**:
```
user-service/
├── src/
│   ├── domain/                # Clean Architecture
│   ├── application/           # Use Cases
│   ├── infrastructure/        # Repositories
│   ├── presentation/          # Controllers
│   └── routes/                # HTTP Routes
```

### Transaction Service

**Responsabilidade**: 
- Gerenciamento de transações
- Cálculos financeiros
- Relatórios e estatísticas

**Banco de Dados**: MongoDB

**Arquitetura**:
```
transaction-service/
├── src/
│   ├── domain/                # Clean Architecture
│   ├── application/           # Use Cases
│   ├── infrastructure/        # Repositories
│   └── routes/                # HTTP Routes
```

---

## ☁️ Azure Functions

### Propósito

As Azure Functions fornecem operações CRUD genéricas para bancos de dados na nuvem, permitindo que o BFF acesse diretamente os bancos quando necessário.

### MongoDB Function

**Responsabilidade**: Operações CRUD no MongoDB

**Endpoints**:
- `POST /api/mongodb?collection=transactions` - Criar documento
- `GET /api/mongodb?collection=transactions&id=xxx` - Buscar documento
- `PUT /api/mongodb?collection=transactions&id=xxx` - Atualizar documento
- `DELETE /api/mongodb?collection=transactions&id=xxx` - Deletar documento

**Melhorias Implementadas**:
- ✅ Sanitização de collection names
- ✅ Tratamento de erros robusto
- ✅ Validação de parâmetros
- ✅ Connection pooling

### Azure SQL Function

**Responsabilidade**: Operações CRUD no Azure SQL

**Endpoints**:
- `POST /api/azuresql?table=users` - Criar registro
- `GET /api/azuresql?table=users&id=xxx` - Buscar registro
- `PUT /api/azuresql?table=users&id=xxx` - Atualizar registro
- `DELETE /api/azuresql?table=users&id=xxx` - Deletar registro

**Melhorias Implementadas**:
- ✅ Proteção contra SQL Injection
- ✅ Sanitização de nomes de tabelas
- ✅ Auto-detecção de tipos de dados
- ✅ Parâmetros parametrizados
- ✅ Connection pooling

---

## 📁 Estrutura de Diretórios

### Estrutura Completa

```
FinCloud/
├── bff/                          # Backend for Frontend
│   ├── src/
│   │   ├── routes/              # Rotas de proxy
│   │   ├── server.js
│   │   └── openapi.json
│   └── package.json
│
├── user-service/                 # Microserviço de Usuários
│   ├── src/
│   │   ├── domain/              # Clean Architecture
│   │   │   ├── entities/
│   │   │   └── repositories/
│   │   ├── application/         # Use Cases
│   │   │   └── features/        # Vertical Slice
│   │   ├── infrastructure/      # Implementações
│   │   │   └── repositories/
│   │   ├── presentation/        # Controllers
│   │   ├── routes/              # HTTP Routes
│   │   ├── config/              # Configurações
│   │   ├── tests/               # Testes
│   │   └── server.js
│   └── package.json
│
├── transaction-service/          # Microserviço de Transações
│   ├── src/
│   │   ├── domain/              # Clean Architecture
│   │   ├── application/         # Use Cases
│   │   │   └── features/        # Vertical Slice
│   │   ├── infrastructure/      # Implementações
│   │   ├── routes/              # HTTP Routes
│   │   ├── config/              # Configurações
│   │   ├── tests/               # Testes
│   │   └── server.js
│   └── package.json
│
├── azure-functions/              # Azure Functions
│   ├── mongodb-function/
│   │   ├── index.js
│   │   └── package.json
│   └── azuresql-function/
│       ├── index.js
│       └── package.json
│
└── docs/                         # Documentação
    └── diagrams/
```

---

## 🔒 Regras de Dependência

### Regras da Clean Architecture

1. **Domain Layer**
   - ❌ NÃO pode importar de `application`
   - ❌ NÃO pode importar de `infrastructure`
   - ❌ NÃO pode importar de `presentation`
   - ✅ Pode importar apenas bibliotecas padrão do JavaScript

2. **Application Layer**
   - ✅ Pode importar de `domain`
   - ❌ NÃO pode importar de `infrastructure`
   - ❌ NÃO pode importar de `presentation`
   - ✅ Pode importar bibliotecas de utilitários (bcrypt, jwt, etc.)

3. **Infrastructure Layer**
   - ✅ Pode importar de `domain`
   - ✅ Pode importar de `application` (para usar use cases)
   - ❌ NÃO pode importar de `presentation`
   - ✅ Pode importar frameworks (TypeORM, MongoDB, etc.)

4. **Presentation Layer**
   - ✅ Pode importar de `application`
   - ✅ Pode importar de `infrastructure`
   - ✅ Pode importar de `domain` (para DTOs)
   - ✅ Pode importar frameworks HTTP (Express, etc.)

### Validação Automática

Os testes de arquitetura validam automaticamente essas regras:

```javascript
// tests/architecture.test.js
describe('Domain Layer', () => {
  it('should not have dependencies on other layers', () => {
    // Verifica que Domain não importa de outras camadas
  });
});
```

---

## 🧪 Testes de Arquitetura

### Tipos de Testes

1. **Testes de Arquitetura**: Validam regras de dependência
2. **Testes de Unidade**: Testam casos de uso isoladamente
3. **Testes de Integração**: Testam integração entre camadas
4. **Testes E2E**: Testam fluxos completos

### Executando Testes

```bash
# Testes de arquitetura do User Service
cd FinCloud/user-service
node src/tests/architecture.test.js

# Testes de arquitetura do Transaction Service
cd FinCloud/transaction-service
node src/tests/architecture.test.js

# Todos os testes (se configurado Jest)
npm test
```

### Estrutura dos Testes

```
tests/
├── architecture.test.js        # Testes de arquitetura
├── unit/                       # Testes unitários
│   ├── usecases/
│   └── entities/
├── integration/                # Testes de integração
│   └── repositories/
└── e2e/                        # Testes end-to-end
    └── flows/
```

---

## 📊 Diagramas

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

### Fluxo de Dependências

```
Presentation → Application → Domain ← Infrastructure
     ↓              ↓                      ↑
     └──────────────┴──────────────────────┘
```

### Arquitetura de Microserviços

```
┌─────────────┐
│   Frontend  │
│   (React)   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│     BFF     │
│  (Gateway)  │
└──────┬──────┘
       │
       ├──────────┐
       ↓          ↓
┌──────────┐  ┌──────────────┐
│   User   │  │ Transaction  │
│ Service  │  │   Service    │
└────┬─────┘  └──────┬───────┘
     │               │
     ↓               ↓
┌──────────┐  ┌──────────────┐
│Azure SQL │  │   MongoDB    │
└──────────┘  └──────────────┘
```

---

## 🎯 Decisões Arquiteturais

### ADR 1: Por que Clean Architecture?

**Contexto**: Necessidade de manter o código organizado e testável em um projeto de microserviços.

**Decisão**: Adotar Clean Architecture para separar responsabilidades e facilitar testes.

**Consequências**:
- ✅ Código mais organizado
- ✅ Facilita testes unitários
- ✅ Permite troca de frameworks sem afetar o core
- ⚠️ Mais complexidade inicial
- ⚠️ Mais arquivos e estrutura

### ADR 2: Por que Vertical Slice?

**Contexto**: Necessidade de organizar features de forma que sejam fáceis de adicionar e manter.

**Decisão**: Combinar Clean Architecture com Vertical Slice para organizar por features.

**Consequências**:
- ✅ Features auto-contidas
- ✅ Facilita adição de novas funcionalidades
- ✅ Reduz acoplamento entre features
- ⚠️ Pode haver duplicação de código

### ADR 3: Por que Azure Functions?

**Contexto**: Necessidade de operações CRUD genéricas nos bancos de dados na nuvem.

**Decisão**: Usar Azure Functions para operações diretas no banco quando necessário.

**Consequências**:
- ✅ Flexibilidade para acessar bancos diretamente
- ✅ Operações serverless escaláveis
- ⚠️ Bypass da lógica de negócio dos serviços
- ⚠️ Precisa de validação adicional

### ADR 4: Por que MongoDB + Azure SQL?

**Contexto**: Diferentes necessidades de dados: transações (documentos) e usuários (relacional).

**Decisão**: MongoDB para transações (flexível) e Azure SQL para usuários (relacional).

**Consequências**:
- ✅ Melhor modelo de dados para cada caso
- ✅ Performance otimizada
- ⚠️ Mais complexidade de infraestrutura
- ⚠️ Precisa gerenciar dois bancos

---

## 📚 Referências

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Vertical Slice Architecture - Jimmy Bogard](https://jimmybogard.com/vertical-slice-architecture/)
- [Microservices Patterns - Chris Richardson](https://microservices.io/patterns/index.html)

---

## ✅ Checklist de Validação

- [x] Clean Architecture implementada
- [x] Vertical Slice organizado
- [x] Testes de arquitetura criados
- [x] Azure Functions melhoradas
- [x] Documentação completa
- [x] README atualizado
- [x] Regras de dependência validadas
- [x] Estrutura de diretórios organizada

---

**Última atualização**: Dezembro 2024
**Versão**: 1.0.0

