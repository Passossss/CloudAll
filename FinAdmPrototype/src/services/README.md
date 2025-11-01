# Serviços da API - FinAdmPrototype

Este diretório contém todos os serviços front-end para comunicação com a API backend.

## Estrutura

```
services/
├── api.ts                   # Cliente HTTP central (axios)
├── config.ts               # Configurações e constantes
├── types.ts                # Tipos TypeScript centralizados
├── index.ts                # Barrel export
├── authService.ts          # Autenticação e usuários
├── accountService.ts       # Contas financeiras
├── categoryService.ts      # Categorias
├── transactionService.ts   # Transações
├── reportService.ts        # Relatórios
├── settingsService.ts      # Configurações do usuário
└── adminService.ts         # Administração (usuários, menu, permissões)
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# URL base da API
VITE_API_BASE=https://api.example.com

# Feature flag para usar mocks (desenvolvimento)
VITE_USE_MOCKS=false
```

### Feature Flags

- **USE_MOCKS**: Quando `true`, permite alternar entre API real e dados mockados
- Útil durante desenvolvimento quando o backend não está disponível

## Como Usar

### 1. Importar Serviços

```typescript
import { authService, transactionService, categoryService } from './services';
```

### 2. Usar nos Componentes

```typescript
import { useTransactions } from './hooks';

function TransactionsPage() {
  const {
    transactions,
    loading,
    error,
    createTransaction,
    deleteTransaction
  } = useTransactions();

  // Seu código aqui
}
```

### 3. Chamadas Diretas

```typescript
import { transactionService } from './services';

async function handleCreate() {
  try {
    const transaction = await transactionService.create({
      accountId: 'acc1',
      categoryId: 'cat1',
      amount: 150.50,
      currency: 'BRL',
      date: '2025-11-01',
      description: 'Compra no mercado',
      type: 'debit'
    });
    console.log('Transação criada:', transaction);
  } catch (error) {
    console.error('Erro:', error);
  }
}
```

## Autenticação

### Login

```typescript
import { authService } from './services';

const response = await authService.login({
  email: 'user@example.com',
  password: 'senha123'
});

// Tokens são salvos automaticamente no localStorage
console.log(response.user);
```

### Refresh Token

O refresh token é tratado automaticamente pelo interceptor do axios:
- Quando uma requisição retorna 401
- O sistema tenta renovar o token usando `/auth/refresh`
- Se bem-sucedido, reexecuta a requisição original
- Se falhar, redireciona para login

### Logout

```typescript
await authService.logout();
// Limpa tokens e redireciona para login
```

## Tratamento de Erros

Todos os erros da API seguem o formato:

```typescript
{
  error: {
    code: 'INVALID_INPUT',
    message: 'Descrição do erro',
    details?: any,
    fields?: { campo: 'mensagem de erro' }
  }
}
```

No código:

```typescript
try {
  await transactionService.create(data);
} catch (error: any) {
  console.log(error.code);      // 'INVALID_INPUT'
  console.log(error.message);   // 'Descrição do erro'
  console.log(error.fields);    // { amount: 'valor inválido' }
  console.log(error.status);    // 400
}
```

## Paginação

Endpoints que retornam listas incluem paginação:

```typescript
const response = await transactionService.list({
  page: 1,
  limit: 20,
  from: '2025-10-01',
  to: '2025-10-31'
});

console.log(response.transactions);
console.log(response.pagination);
// {
//   current: 1,
//   pages: 5,
//   total: 98,
//   limit: 20
// }
```

## Filtros

### Transações

```typescript
await transactionService.list({
  accountId: 'acc1',
  categoryId: 'cat1',
  type: 'debit',
  from: '2025-10-01',
  to: '2025-10-31',
  search: 'mercado',
  sort: '-date',  // ordenar por data decrescente
  page: 1,
  limit: 20
});
```

### Categorias

```typescript
await categoryService.list({
  type: 'expense',
  search: 'alimentação'
});
```

### Usuários (Admin)

```typescript
await adminService.listUsers({
  role: 'normal',
  status: 'active',
  search: 'joão',
  page: 1,
  limit: 20
});
```

## Exportação

### Exportar Transações (CSV)

```typescript
import { useTransactions } from './hooks';

const { exportToCSV } = useTransactions();

await exportToCSV();
// Faz download automático do arquivo CSV
```

### Exportar Relatório (PDF/Excel)

```typescript
import { useReports } from './hooks';

const { exportToPDF, exportToExcel } = useReports();

await exportToPDF({
  from: '2025-10-01',
  to: '2025-10-31',
  groupBy: 'category'
});
```

## Relatórios

### Resumo Financeiro

```typescript
import { reportService } from './services';

const summary = await reportService.getSummary({
  from: '2025-10-01',
  to: '2025-10-31',
  groupBy: 'category'
});

console.log(summary.totals);
console.log(summary.items);
```

### Fluxo de Caixa

```typescript
const cashflow = await reportService.getCashFlow(
  '2025-10-01',
  '2025-10-31',
  'acc1' // opcional: filtrar por conta
);

console.log(cashflow.data);
console.log(cashflow.summary);
```

### Relatório Mensal

```typescript
const monthly = await reportService.getMonthly(12); // últimos 12 meses

monthly.forEach(month => {
  console.log(month.month, month.income, month.expense, month.balance);
});
```

## Administração

### Gerenciar Usuários

```typescript
import { adminService } from './services';

// Listar usuários
const users = await adminService.listUsers({ role: 'all' });

// Criar usuário
const newUser = await adminService.createUser({
  name: 'João Silva',
  email: 'joao@example.com',
  password: 'senha123',
  role: 'normal'
});

// Alterar status
await adminService.toggleUserStatus(userId, 'inactive');

// Resetar senha
await adminService.resetUserPassword(userId, 'novaSenha123');
```

### Estatísticas do Sistema

```typescript
const stats = await adminService.getSystemStats();

console.log(stats.totalUsers);
console.log(stats.activeUsers);
console.log(stats.totalTransactions);
```

### Menu e Permissões

```typescript
// Obter menu
const menu = await adminService.getMenu();

// Atualizar menu
await adminService.updateMenu({ items: [...] });

// Obter permissões
const permissions = await adminService.getPermissions();

// Verificar permissão
const hasPermission = await adminService.checkPermission('transactions', 'create');
```

## Configurações

### Obter Configurações

```typescript
import { settingsService } from './services';

const settings = await settingsService.getSettings();
console.log(settings.theme);
console.log(settings.notifications);
```

### Atualizar Configurações

```typescript
// Atualizar tema
await settingsService.updateTheme('dark');

// Atualizar notificações
await settingsService.updateNotifications({
  email: true,
  push: false,
  transactionAlerts: true,
  weeklyReport: true
});

// Atualizar tudo de uma vez
await settingsService.updateSettings({
  theme: 'dark',
  language: 'pt-BR',
  currency: 'BRL'
});
```

## Hooks Customizados

### useTransactions

```typescript
const {
  transactions,          // Lista de transações
  loading,              // Estado de carregamento
  error,                // Erro se houver
  pagination,           // Info de paginação
  stats,                // Estatísticas
  createTransaction,    // Criar transação
  updateTransaction,    // Atualizar transação
  deleteTransaction,    // Deletar transação
  duplicateTransaction, // Duplicar transação
  refreshTransactions,  // Recarregar lista
  loadStats,           // Carregar estatísticas
  exportToCSV          // Exportar para CSV
} = useTransactions(filters);
```

### useCategories

```typescript
const {
  categories,           // Lista de categorias
  loading,
  error,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,    // Drag & drop
  importDefaults,       // Importar categorias padrão
  refreshCategories
} = useCategories(filters);
```

### useAccounts

```typescript
const {
  accounts,
  loading,
  error,
  stats,
  totalBalance,         // Saldo total de todas as contas
  createAccount,
  updateAccount,
  deleteAccount,
  refreshAccounts,
  loadStats
} = useAccounts(filters);
```

### useReports

```typescript
const {
  loading,
  error,
  getSummary,           // Obter resumo
  getCashFlow,          // Obter fluxo de caixa
  getMonthlyReport,     // Obter relatório mensal
  exportToPDF,          // Exportar PDF
  exportToExcel         // Exportar Excel
} = useReports();
```

### useSettings

```typescript
const {
  settings,
  loading,
  error,
  updateSettings,
  updateTheme,
  updateNotifications,
  updatePrivacy,
  resetToDefaults,
  exportUserData,       // Exportar dados (GDPR)
  deleteAccount,        // Excluir conta
  refreshSettings
} = useSettings();
```

### useAdminUsers

```typescript
const {
  users,
  loading,
  error,
  pagination,
  stats,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetPassword,
  refreshUsers,
  loadStats,
  exportUsers
} = useAdminUsers(filters);
```

## Migração de Mocks

### Antes (Mock)

```typescript
const mockTransactions = [
  { id: '1', amount: 100, ... }
];

function getTransactions() {
  return mockTransactions;
}
```

### Depois (API Real)

```typescript
import { transactionService } from './services';

async function getTransactions() {
  return await transactionService.list();
}
```

### Com Feature Flag

```typescript
import { apiOrMock, mockDelay } from './services';

async function getTransactions() {
  return apiOrMock(
    // API real
    () => transactionService.list(),
    // Mock
    async () => {
      await mockDelay(500);
      return mockTransactions;
    }
  );
}
```

## Prioridade de Implementação

### Sprint 1 (MVP) ✅
- ✅ Auth (login/refresh/logout)
- ✅ Transactions CRUD
- ✅ Accounts list
- ✅ Categories list
- ✅ Users list

### Sprint 2
- ✅ Reports summary
- ✅ Transactions filters
- ✅ Create Account
- ✅ User CRUD

### Sprint 3
- ✅ Permissions
- ✅ Menu management
- ✅ Settings
- ✅ Import CSV

## Segurança

### Tokens
- **Access Token**: Curta duração (15-60 min), usado em todas as requisições
- **Refresh Token**: Longa duração (7-30 dias), usado apenas para renovar access token
- Tokens são armazenados em `localStorage` (produção deve usar httpOnly cookies)

### Proteção CSRF
- Em produção, implementar tokens CSRF
- Usar httpOnly cookies para refresh tokens
- Validar origem das requisições

### Sanitização
- Toda entrada de usuário deve ser sanitizada
- Validação no cliente E no servidor
- Escapar HTML em displays

## Troubleshooting

### Erro 401 (Unauthorized)
- Token expirado ou inválido
- Sistema tenta refresh automático
- Se falhar, redireciona para login

### Erro 403 (Forbidden)
- Usuário autenticado mas sem permissão
- Verificar role do usuário
- Verificar permissões no backend

### Erro 404 (Not Found)
- Recurso não existe
- Verificar ID do recurso
- Verificar URL do endpoint

### Erro de Rede
- Backend offline
- Problema de conectividade
- Verificar CORS no backend

### Erro de CORS
- Backend deve permitir origem do frontend
- Adicionar headers necessários no servidor
- Verificar credenciais (cookies)

## Testes

### Unit Tests

```typescript
import { transactionService } from './services';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/transactions', (req, res, ctx) => {
    return res(ctx.json({ transactions: [] }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('lista transações', async () => {
  const result = await transactionService.list();
  expect(result.transactions).toEqual([]);
});
```

## Próximos Passos

1. ✅ Implementar serviços básicos
2. ✅ Adicionar refresh token automático
3. ✅ Criar hooks customizados
4. ⏳ Adicionar testes unitários
5. ⏳ Implementar cache/offline support
6. ⏳ Adicionar retry logic para falhas
7. ⏳ Otimizar bundle size
8. ⏳ Documentar API com OpenAPI/Swagger

## Recursos

- [Axios Documentation](https://axios-http.com/)
- [React Query](https://tanstack.com/query/latest) - Alternativa para cache
- [SWR](https://swr.vercel.app/) - Alternativa para cache
- [MSW](https://mswjs.io/) - Mock Service Worker para testes
