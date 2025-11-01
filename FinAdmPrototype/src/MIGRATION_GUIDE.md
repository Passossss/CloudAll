# Guia de Migração: Mocks → API Real

Este guia detalha o processo de migração dos dados mockados para a API real no FinAdmPrototype.

## 📋 Checklist de Migração

### ✅ Fase 1: Preparação (Concluída)

- [x] Criar estrutura de serviços
- [x] Implementar cliente HTTP central (api.ts)
- [x] Adicionar sistema de refresh token
- [x] Criar tipos TypeScript centralizados
- [x] Implementar todos os serviços principais
- [x] Criar hooks customizados
- [x] Adicionar feature flag USE_MOCKS

### ⏳ Fase 2: Configuração (Próximo)

- [ ] Copiar `.env.example` para `.env`
- [ ] Configurar `VITE_API_BASE` com URL do backend
- [ ] Definir `VITE_USE_MOCKS` (true para desenvolvimento, false para produção)
- [ ] Testar conexão com backend
- [ ] Verificar CORS no backend

### ⏳ Fase 3: Migração Gradual

- [ ] Migrar autenticação (login/logout)
- [ ] Migrar transações
- [ ] Migrar categorias
- [ ] Migrar contas
- [ ] Migrar usuários (admin)
- [ ] Migrar relatórios
- [ ] Migrar configurações

### ⏳ Fase 4: Testes

- [ ] Testar todos os fluxos principais
- [ ] Testar tratamento de erros
- [ ] Testar paginação
- [ ] Testar filtros
- [ ] Testar exportações
- [ ] Testar refresh token

### ⏳ Fase 5: Deploy

- [ ] Configurar variáveis de ambiente em produção
- [ ] Fazer deploy do frontend
- [ ] Monitorar erros (Sentry)
- [ ] Coletar feedback dos usuários

## 🔧 Configuração Inicial

### 1. Criar arquivo .env

```bash
cp .env.example .env
```

### 2. Editar .env

```env
# Para desenvolvimento com backend local
VITE_API_BASE=http://localhost:3000/api
VITE_USE_MOCKS=false

# Para desenvolvimento com mocks
VITE_API_BASE=https://api.example.com
VITE_USE_MOCKS=true

# Para produção
VITE_API_BASE=https://api.fin.app
VITE_USE_MOCKS=false
```

### 3. Instalar dependências

```bash
npm install axios
```

## 📝 Padrões de Migração

### Antes: Componente com Mock

```typescript
// components/Transactions.tsx
import { useState, useEffect } from 'react';

const mockTransactions = [
  { id: '1', amount: 100, description: 'Compra' }
];

export function Transactions() {
  const [transactions, setTransactions] = useState(mockTransactions);
  
  // ... resto do código
}
```

### Depois: Componente com Hook

```typescript
// components/Transactions.tsx
import { useTransactions } from '../hooks';

export function Transactions() {
  const {
    transactions,
    loading,
    error,
    createTransaction,
    deleteTransaction
  } = useTransactions();
  
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  // ... resto do código
}
```

### Alternativa: Componente com Serviço Direto

```typescript
// components/Transactions.tsx
import { useState, useEffect } from 'react';
import { transactionService } from '../services';

export function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function load() {
      try {
        const response = await transactionService.list();
        setTransactions(response.transactions);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  
  // ... resto do código
}
```

## 🔄 Migração por Módulo

### 1. Autenticação

#### Antes
```typescript
function handleLogin(email: string, password: string) {
  if (email === 'admin@example.com' && password === 'admin') {
    const mockUser = { id: '1', name: 'Admin', role: 'admin' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    return mockUser;
  }
  throw new Error('Credenciais inválidas');
}
```

#### Depois
```typescript
import { authService } from '../services';

async function handleLogin(email: string, password: string) {
  try {
    const response = await authService.login({ email, password });
    return response.user;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
}
```

### 2. Transações

#### Antes
```typescript
const mockTransactions = [...];

function getTransactions() {
  return mockTransactions;
}

function createTransaction(data) {
  const newTransaction = { id: Date.now().toString(), ...data };
  mockTransactions.push(newTransaction);
  return newTransaction;
}
```

#### Depois
```typescript
import { useTransactions } from '../hooks';

function TransactionsPage() {
  const {
    transactions,
    loading,
    error,
    createTransaction,
    pagination
  } = useTransactions({
    page: 1,
    limit: 20
  });
  
  async function handleCreate(data) {
    try {
      await createTransaction(data);
      toast.success('Transação criada!');
    } catch (error) {
      toast.error('Erro ao criar transação');
    }
  }
  
  // ... resto do código
}
```

### 3. Categorias

#### Antes
```typescript
const mockCategories = [
  { id: '1', name: 'Alimentação', color: '#ff0000', icon: 'utensils' }
];

function getCategories() {
  return mockCategories;
}
```

#### Depois
```typescript
import { useCategories } from '../hooks';

function CategoriesPage() {
  const {
    categories,
    loading,
    createCategory,
    deleteCategory
  } = useCategories({ type: 'all' });
  
  // ... resto do código
}
```

### 4. Relatórios

#### Antes
```typescript
function generateReport(from: string, to: string) {
  const filtered = mockTransactions.filter(t => 
    t.date >= from && t.date <= to
  );
  
  return {
    income: filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    expense: filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  };
}
```

#### Depois
```typescript
import { useReports } from '../hooks';

function ReportsPage() {
  const { getSummary, loading } = useReports();
  const [report, setReport] = useState(null);
  
  async function loadReport() {
    try {
      const data = await getSummary({
        from: '2025-10-01',
        to: '2025-10-31',
        groupBy: 'category'
      });
      setReport(data);
    } catch (error) {
      console.error(error);
    }
  }
  
  // ... resto do código
}
```

## 🚨 Tratamento de Erros

### Padrão de Erro da API

```typescript
try {
  await transactionService.create(data);
} catch (error: any) {
  // Erro formatado pelo interceptor
  console.error('Código:', error.code);          // 'INVALID_INPUT'
  console.error('Mensagem:', error.message);     // 'Valor inválido'
  console.error('Campos:', error.fields);        // { amount: 'deve ser positivo' }
  console.error('Status HTTP:', error.status);   // 400
  
  // Exibir para o usuário
  if (error.fields) {
    Object.entries(error.fields).forEach(([field, msg]) => {
      toast.error(`${field}: ${msg}`);
    });
  } else {
    toast.error(error.message);
  }
}
```

### Componente de Erro Padrão

```typescript
import { ErrorState } from '../components/common/ErrorState';

function MyComponent() {
  const { data, error, loading } = useMyHook();
  
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refresh} />;
  
  return <div>{/* conteúdo */}</div>;
}
```

## 🔒 Autenticação e Tokens

### Fluxo de Autenticação

1. **Login**: Usuário envia email/senha
2. **Backend retorna**: accessToken, refreshToken, user
3. **Frontend salva**: Tokens no localStorage, user no state
4. **Requisições**: Interceptor adiciona accessToken automaticamente
5. **Token expira**: Interceptor detecta 401, chama /auth/refresh
6. **Refresh sucesso**: Atualiza tokens, repete requisição
7. **Refresh falha**: Limpa dados, redireciona para login

### Configuração Manual

```typescript
import { authService } from '../services';

// Login
const { user, accessToken } = await authService.login({
  email: 'user@example.com',
  password: 'senha123'
});

// Verificar autenticação
if (authService.isAuthenticated()) {
  console.log('Usuário logado');
}

// Obter usuário atual
const currentUser = authService.getCurrentUser();

// Logout
await authService.logout();
```

## 📊 Paginação

### Hook com Paginação

```typescript
const [page, setPage] = useState(1);
const {
  transactions,
  pagination,
  loading
} = useTransactions({ page, limit: 20 });

// pagination.current = página atual
// pagination.pages = total de páginas
// pagination.total = total de itens
// pagination.limit = itens por página

function handlePageChange(newPage: number) {
  setPage(newPage);
}
```

### Componente de Paginação

```typescript
<Pagination
  currentPage={pagination.current}
  totalPages={pagination.pages}
  onPageChange={handlePageChange}
/>
```

## 🔍 Filtros

### Múltiplos Filtros

```typescript
const [filters, setFilters] = useState({
  type: 'all',
  categoryId: '',
  from: '',
  to: '',
  search: ''
});

const { transactions } = useTransactions(filters);

function handleFilterChange(key: string, value: any) {
  setFilters(prev => ({ ...prev, [key]: value }));
}
```

### Debounce em Busca

```typescript
import { useState, useEffect } from 'react';
import { useDebouncedValue } from './hooks/useDebouncedValue';

function SearchableList() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 500);
  
  const { items } = useItems({ search: debouncedSearch });
  
  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Buscar..."
    />
  );
}
```

## 📤 Exportação

### Exportar CSV

```typescript
import { useTransactions } from '../hooks';

function ExportButton() {
  const { exportToCSV, loading } = useTransactions();
  
  async function handleExport() {
    try {
      await exportToCSV();
      toast.success('Exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar');
    }
  }
  
  return (
    <Button onClick={handleExport} disabled={loading}>
      Exportar CSV
    </Button>
  );
}
```

### Exportar Relatório PDF

```typescript
import { useReports } from '../hooks';

function ReportExport() {
  const { exportToPDF } = useReports();
  
  async function handleExport() {
    await exportToPDF({
      from: '2025-10-01',
      to: '2025-10-31',
      groupBy: 'category'
    });
  }
  
  return <Button onClick={handleExport}>Exportar PDF</Button>;
}
```

## 🧪 Testes

### Testar com MSW

```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/transactions', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        transactions: [
          { id: '1', amount: 100, description: 'Test' }
        ],
        pagination: { current: 1, pages: 1, total: 1, limit: 20 }
      })
    );
  }),
  
  rest.post('/api/transactions', (req, res, ctx) => {
    const body = req.body;
    return res(
      ctx.status(201),
      ctx.json({
        transaction: { id: '2', ...body }
      })
    );
  })
];
```

### Usar em Testes

```typescript
// src/components/Transactions.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { server } from '../mocks/server';
import { Transactions } from './Transactions';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('exibe transações', async () => {
  render(<Transactions />);
  
  await waitFor(() => {
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## 🐛 Debugging

### Logs de Desenvolvimento

O cliente API automaticamente loga em desenvolvimento:

```
[API] POST /transactions { amount: 100, ... }
[API] Response from /transactions { transaction: {...} }
[API] Error: { code: 'INVALID_INPUT', message: '...' }
```

### Ferramentas

1. **Redux DevTools**: Monitorar state
2. **React Query DevTools**: Cache de queries
3. **Network Tab**: Inspecionar requisições HTTP
4. **Sentry**: Monitorar erros em produção

## 🚀 Deploy

### Configurar Variáveis de Ambiente

#### Vercel
```bash
vercel env add VITE_API_BASE production
# Digite: https://api.fin.app

vercel env add VITE_USE_MOCKS production
# Digite: false
```

#### Netlify
```bash
# netlify.toml
[build.environment]
  VITE_API_BASE = "https://api.fin.app"
  VITE_USE_MOCKS = "false"
```

#### Variáveis no Dashboard
- Vercel: Settings → Environment Variables
- Netlify: Site settings → Build & deploy → Environment

## ✅ Checklist Final

Antes de fazer deploy para produção:

- [ ] Todos os endpoints estão implementados
- [ ] Tratamento de erros está funcionando
- [ ] Refresh token funciona corretamente
- [ ] CORS configurado no backend
- [ ] Variáveis de ambiente configuradas
- [ ] USE_MOCKS = false em produção
- [ ] Testes passando
- [ ] Logs de erro configurados (Sentry)
- [ ] SSL/HTTPS habilitado
- [ ] Rate limiting no backend
- [ ] Documentação atualizada

## 📚 Referências

- [Documentação dos Serviços](./services/README.md)
- [Resumo de Endpoints](./guidelines/API_ENDPOINTS.md)
- [Axios Documentation](https://axios-http.com/)
- [React Hooks](https://react.dev/reference/react)

## 🆘 Suporte

Se encontrar problemas:

1. Verificar logs do console
2. Verificar Network tab
3. Confirmar variáveis de ambiente
4. Testar endpoint no Postman/Insomnia
5. Verificar CORS no backend
6. Consultar documentação da API

## 🎉 Próximos Passos

Após migração completa:

1. Implementar cache com React Query ou SWR
2. Adicionar offline support com Service Workers
3. Otimizar bundle size (code splitting)
4. Implementar analytics
5. Adicionar testes E2E com Cypress/Playwright
6. Implementar CI/CD pipeline
