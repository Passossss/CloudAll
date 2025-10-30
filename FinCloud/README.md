# Fin - Microservices Architecture

Aplicativo de gestão financeira pessoal construído com arquitetura de microserviços.

## 🏗️ Arquitetura

O projeto é composto por 3 serviços principais:

### 1. BFF (Backend for Frontend) - Porta 3000
- **Responsabilidade**: Gateway de APIs e orquestração de serviços
- **Tecnologia**: Node.js + Express
- **Funcionalidades**:
  - Proxy para microserviços
  - Rate limiting e segurança
  - Health checks centralizados

### 2. User Service - Porta 3001
- **Responsabilidade**: Gerenciamento de usuários e perfis
- **Banco de Dados**: SQL Server (Docker)
- **Funcionalidades**:
  - Registro e autenticação de usuários
  - Gerenciamento de perfis financeiros
  - Estatísticas de usuários

### 3. Transaction Service - Porta 3002
- **Responsabilidade**: Gerenciamento de transações financeiras
- **Banco de Dados**: MongoDB (Docker)
- **Funcionalidades**:
  - CRUD de transações
  - Relatórios e resumos financeiros
  - Categorização automática

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- Git

### Inicialização Rápida

**Windows:**
```bash
# Clone o repositório
git clone <repository-url>
cd FinCloud

# Execute o script de inicialização
start.bat
```

**Linux/Mac:**
```bash
# Clone o repositório
git clone <repository-url>
cd FinCloud

# Execute o script de inicialização
chmod +x start.sh
./start.sh
```

### Inicialização Manual

1. **Configurar arquivos .env:**
```bash
node setup-env.js
```

2. **Iniciar bancos de dados:**
```bash
docker-compose up -d
```

3. **Aguardar bancos ficarem prontos (30 segundos)**

4. **Inicializar banco SQL Server:**
```bash
docker exec fin-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P FinApp123! -i /docker-entrypoint-initdb.d/init-db.sql
```

5. **Instalar dependências:**
```bash
npm run install-all
```

6. **Executar microserviços:**
```bash
npm run dev
```

### Executar serviços separadamente (recomendado em desenvolvimento)

Abra três terminais PowerShell e execute um serviço por terminal:

```powershell
cd "C:\Users\Gustavo Passos\Desktop\Develop\arq\FinCloud\bff"
npm run dev

cd "C:\Users\Gustavo Passos\Desktop\Develop\arq\FinCloud\user-service"
npm run dev

cd "C:\Users\Gustavo Passos\Desktop\Develop\arq\FinCloud\transaction-service"
npm run dev
```

Para evitar que o TypeORM faça alterações automáticas no schema do banco (danger in prod), os serviços que usam TypeORM só ativam a sincronização quando a variável `TYPEORM_SYNC` está definida igual a 'true'. Por exemplo, para ativar somente no `user-service` (dev):

```powershell
#$env:TYPEORM_SYNC='true'; npm run dev
```

### Rodar a migration de alinhamento (SQL Server)

Um migration SQL seguro foi gerado em `user-service/migrations/0001_align_schema.sql` que adiciona colunas ausentes apenas se elas não existirem. Para aplicá-la usando o container do SQL Server (sem instalar ferramentas locais):

```powershell
# Executa a migration no container fin-sqlserver (ajuste senha se necessário)
docker run --rm --network fincloud_fin-network mcr.microsoft.com/mssql-tools \
  /opt/mssql-tools/bin/sqlcmd -S fin-sqlserver -U sa -P 'FinApp123!' -d fin_users_db \
  -i user-service/migrations/0001_align_schema.sql
```

OBS: revise o SQL antes de executar em ambientes com dados sensíveis.

### Smoke test (checagem rápida)

Se quiser rodar uma checagem automática que cria um usuário e uma transação (útil em CI/dev), você pode executar o script temporário `scripts/smoke-test.js` (se existir). No nosso fluxo atual removemos o script temporário para evitar artefatos, mas você pode recriá-lo rapidamente com um requisição HTTP ou usando curl/Invoke-RestMethod:

```powershell
# Exemplo simples para registrar um usuário (PowerShell)
Invoke-RestMethod -Uri 'http://localhost:3001/api/users/register' -Method Post -Body (ConvertTo-Json @{email='smoke.test+1@example.com'; password='Passw0rd!'; name='Smoke'}) -ContentType 'application/json'

# Depois crie uma transação utilizando o userId retornado:
Invoke-RestMethod -Uri 'http://localhost:3002/api/transactions' -Method Post -Body (ConvertTo-Json @{userId='<USER_ID>'; amount=100; description='Smoke'; category='salary'; type='income'}) -ContentType 'application/json'
```

### Acessar Aplicações
- **FinApp (Usuário):** http://localhost:5173
- **FinAdm (Admin):** http://localhost:5174

## 📊 Endpoints Principais

### BFF (http://localhost:3000)
- `GET /api/health` - Health check geral
- `POST /api/users/register` - Registro de usuário
- `POST /api/users/login` - Login
- `GET /api/transactions/user/:id` - Transações do usuário

### User Service (http://localhost:3001)
- `POST /api/users/register` - Criar usuário
- `POST /api/users/login` - Autenticar usuário
- `GET /api/users/profile/:id` - Obter perfil
- `PUT /api/users/profile/:id` - Atualizar perfil

### Transaction Service (http://localhost:3002)
- `POST /api/transactions` - Criar transação
- `GET /api/transactions/user/:userId` - Listar transações
- `GET /api/transactions/user/:userId/summary` - Resumo financeiro
- `PUT /api/transactions/:id` - Atualizar transação
- `DELETE /api/transactions/:id` - Excluir transação

## 🗄️ Estrutura de Dados

### Usuários (SQL Server)
```sql
users: id, email, password, name, age, created_at, is_active
user_profiles: id, user_id, monthly_income, financial_goals, spending_limit
```

### Transações (MongoDB)
```javascript
{
  userId: String,
  amount: Number,
  description: String,
  category: String, // food, transport, entertainment, etc.
  type: String, // income, expense
  date: Date,
  tags: [String],
  isRecurring: Boolean,
  recurringPeriod: String
}
```

## 🔒 Segurança

- JWT para autenticação
- Helmet para headers de segurança
- Rate limiting no BFF
- Validação de dados with Joi
- Sanitização de inputs
- CORS configurado

## 📈 Monitoramento

- Logs centralizados (Morgan)
- Health checks em todos os serviços
- Métricas de performance
- Error tracking

## 🧪 Testes

```bash
# Executar testes em todos os serviços
npm test
```

## 🔧 Desenvolvimento

### Adicionando Novos Serviços
1. Crie nova pasta na raiz
2. Configure package.json
3. Adicione scripts no package.json raiz
4. Configure rotas no BFF

### Padrões de Código
- ESLint configurado
- Prettier para formatação
- Conventional Commits
- Documentação inline

## 📱 Frontend Integration

O BFF expõe uma API RESTful que pode ser consumida por qualquer cliente:
- React Native (mobile)
- React/Vue (web)
- Flutter (cross-platform)

Todas as rotas seguem padrões REST com responses JSON consistentes.