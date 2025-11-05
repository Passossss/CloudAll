# 🧪 Guia de Testes - FinCloud

## 📋 Sumário

Este documento descreve a estratégia de testes do projeto FinCloud, incluindo como executar os testes e validar a arquitetura.

## 🎯 Tipos de Testes

### 1. Testes de Arquitetura

Validam que as regras de dependência da Clean Architecture estão sendo respeitadas.

**Localização**: 
- `FinCloud/user-service/src/tests/architecture.test.js`
- `FinCloud/transaction-service/src/tests/architecture.test.js`

**O que valida**:
- ✅ Domain Layer não depende de outras camadas
- ✅ Application Layer só depende de Domain
- ✅ Infrastructure não depende de Presentation
- ✅ Vertical Slice está organizado corretamente

**Executar**:
```bash
# User Service
cd FinCloud/user-service
node src/tests/architecture.test.js

# Transaction Service
cd FinCloud/transaction-service
node src/tests/architecture.test.js

# Todos os testes
node test-all.js
```

### 2. Testes Unitários

Testam casos de uso isoladamente, usando mocks das dependências.

**Localização**:
- `FinCloud/user-service/src/tests/unit/`
- `FinCloud/transaction-service/src/tests/unit/`

**Exemplos**:
- `RegisterUserUseCase.test.js` - Testa registro de usuário
- `CreateTransactionUseCase.test.js` - Testa criação de transação

**Executar**:
```bash
cd FinCloud/user-service
npm test

# Ou com Jest diretamente
npm test -- --testPathPattern=unit
```

### 3. Testes de Integração

Testam a integração entre camadas, usando banco de dados real.

**Localização**:
- `FinCloud/user-service/src/tests/integration/`

**Exemplos**:
- `UserRepository.test.js` - Testa repositório com banco real

**Executar**:
```bash
# Requer banco de dados configurado
cd FinCloud/user-service
npm test -- --testPathPattern=integration
```

### 4. Testes E2E (End-to-End)

Testam fluxos completos do sistema (a implementar).

## 🚀 Executando Todos os Testes

### Script Principal

Execute na raiz do projeto:

```bash
node test-all.js
```

Este script:
- ✅ Executa testes de arquitetura de todos os serviços
- ✅ Lista testes unitários disponíveis
- ✅ Lista testes de integração disponíveis
- ✅ Fornece resumo completo

### Testes por Serviço

#### User Service

```bash
cd FinCloud/user-service
node src/tests/run-all-tests.js
```

#### Transaction Service

```bash
cd FinCloud/transaction-service
node src/tests/run-all-tests.js
```

## 📊 Resultados dos Testes

### Testes de Arquitetura - Status

#### User Service
- ✅ Domain Layer: Passando
- ⚠️ Application Layer: Passando (com violação controlada para imports de infrastructure)
- ✅ Infrastructure Layer: Passando
- ✅ Vertical Slice: Passando

#### Transaction Service
- ✅ Domain Layer: Passando
- ✅ Application Layer: Passando
- ✅ Vertical Slice: Passando

### Nota sobre Violação Controlada

Os Use Cases têm imports de Infrastructure para valores default:
```javascript
const UserRepository = require('../../../infrastructure/repositories/UserRepository');

class RegisterUserUseCase {
  constructor(userRepository = null) {
    this.userRepository = userRepository || new UserRepository();
  }
}
```

**Idealmente**: Dependências devem ser injetadas via construtor.
**Praticamente**: Permitimos para facilitar uso, mas idealmente devem ser injetadas.

## 🔧 Configuração de Testes

### Jest (Recomendado)

Para testes mais completos, instale Jest:

```bash
cd FinCloud/user-service
npm install --save-dev jest
```

Configure `jest.config.js`:
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/server.js'
  ]
};
```

### Testes sem Jest

Os testes de arquitetura funcionam sem Jest, usando um runner simples.

## 📝 Criando Novos Testes

### Teste de Arquitetura

```javascript
// tests/architecture.test.js
describe('Clean Architecture', () => {
  it('should validate dependency rules', () => {
    // Validar imports
  });
});
```

### Teste Unitário

```javascript
// tests/unit/MyUseCase.test.js
const MyUseCase = require('../../application/features/my-feature/MyUseCase');

describe('MyUseCase', () => {
  it('should do something', async () => {
    // Teste
  });
});
```

### Teste de Integração

```javascript
// tests/integration/MyRepository.test.js
const MyRepository = require('../../infrastructure/repositories/MyRepository');

describe('MyRepository', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  it('should save data', async () => {
    // Teste com banco real
  });
});
```

## ✅ Checklist de Validação

Execute antes de fazer commit:

- [ ] Testes de arquitetura passando
- [ ] Testes unitários passando
- [ ] Testes de integração passando (se aplicável)
- [ ] Cobertura de código adequada
- [ ] Sem erros de lint

## 🐛 Troubleshooting

### Erro: "missing ) after argument list"

Verifique se todas as chaves e parênteses estão fechados corretamente nos arquivos de teste.

### Erro: "Cannot find module"

Execute `npm install` no diretório do serviço.

### Testes de integração falhando

Certifique-se de que:
- Banco de dados está rodando
- Variáveis de ambiente estão configuradas
- Conexão com banco está funcionando

## 📚 Referências

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Clean Architecture Testing](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Última atualização**: Dezembro 2024

