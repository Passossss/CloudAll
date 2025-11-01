# FinCloud — Instruções essenciais (rápido e direto)

Breve: este repositório contém o BFF e dois microserviços (user-service, transaction-service) e frontends prototypes. Abaixo estão apenas os comandos necessários para rodar localmente.

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

Pré-requisitos
- Node.js 18+
- Docker & Docker Compose

1) Subir infra (bancos)
```powershell
# a partir da raiz FinCloud
docker-compose up -d
```

2) Instalar dependências (uma vez)
```powershell
npm run install-all
```

3) Inicializar bancos (manual — necessario rodar)
```powershell
# roda a inicialização SQL (apenas se a base não existir) e cria/seed no Mongo (se vazio)
npm run db:init
```

Comportamento: o script `db:init` é idempotente — ele detecta se o banco SQL já existe e pula a criação; no Mongo, insere categorias/transactions apenas se as coleções estiverem vazias.

4) Rodar em modo desenvolvimento (cada serviço em terminal) — exemplo PowerShell
```powershell
# BFF
cd .\bff
npm run dev

# user-service
cd ..\user-service
npm run dev

# transaction-service
cd ..\transaction-service
npm run dev
```

Frontends (prototypes)
- FinApp (usuário):
```powershell
cd ..\FinAppPrototype
npm install
npm run dev
# abre em http://localhost:5173 (Vite)
```
- FinAdm (admin):
```powershell
cd ..\FinAdmPrototype
npm install
npm run dev
# abre em http://localhost:5174
```

Verificação rápida (após subir serviços)
- Usuários (public GET-all):
```powershell
Invoke-RestMethod -Uri 'http://localhost:3001/api/users' -Method Get
```
- Transações (public GET-all):
```powershell
Invoke-RestMethod -Uri 'http://localhost:3002/api/transactions' -Method Get
```

Notas importantes (curtas)
- Execute `npm run db:init` manualmente em uma máquina nova — os scripts no repositório não forçam recriação de bancos já existentes.
- `TYPEORM_SYNC` = 'true' ativa sincronização automática do TypeORM (dev only). Não ative em produção.
- Se preferir tudo automático via Docker, posso adicionar um serviço `sql-init` no `docker-compose` para executar o `.sql` na primeira subida.

Problemas comuns
- Se `npm run db:init` falhar por não conseguir alcançar o `user-service`, garanta que `user-service` esteja rodando (porta 3001) antes de executar o passo de seed do Mongo.

Pronto. Se quiser, eu adiciono o serviço `sql-init` no compose para automatizar totalmente a criação do DB na primeira subida — diga se prefere que eu faça isso.