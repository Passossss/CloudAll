# FinCloud — Visão Geral, Arquitetura e Guia de Operação

Última atualização: 2025-10-27

Este documento profissional descreve a arquitetura, componentes, publicações, instruções para executar localmente (Windows / PowerShell), endpoints principais, detalhes de deploy e procedimentos de troubleshooting para o projeto FinCloud.

## Sumário

- Visão geral
- Componentes e responsabilidades
- Endpoints públicos & imagens Docker
- Estrutura de pastas (resumo)
- Como rodar localmente (PowerShell, Docker)
- Testes rápidos (register / login / CRUD transações)
- Swagger / OpenAPI
- CI / CD e publicação (resumo)
- Troubleshooting comum
- Contribuidores e contato

## 1 — Visão geral

FinCloud é uma aplicação demonstrativa que adota uma arquitetura de microsserviços com microfrontends. A comunicação externa é feita por um BFF (Backend For Frontend) que agrega dados e expõe endpoints REST consumidos pelos microfrontends.

Principais objetivos do repositório:
- Demonstrar integração entre múltiplos bancos (MongoDB e SQL Server)
- Exemplificar patterns de BFF, microfrontends e serverless functions
- Fornecer artefatos prontos para CI/CD e deploy em Azure Static Web Apps e Azure Functions

## 2 — Componentes

- Microfrontends
  - FinAPP (cliente principal) — TypeScript / React / Vite. Porta de desenvolvimento padrão: 5173.
  - FinADM (painel administrativo) — TypeScript / React / Vite. Porta de desenvolvimento padrão: 5174.

- BFF (FinCloud BFF)
  - Local: `FinCloud/bff`
  - Porta local: 3000
  - Responsabilidade: agregar e proxyar chamadas para `user-service` e `transaction-service`, expor endpoints unificados como `/api/users`, `/api/transactions` e `/api/health`.

- Microserviços
  - User Service
    - Local: `FinCloud/user-service`
    - Banco: Microsoft SQL Server (container / Azure SQL)
    - Porta local típica do serviço: 3001 (acessado via BFF como proxied)
  - Transaction Service
    - Local: `FinCloud/transaction-service`
    - Banco: MongoDB (container / Atlas)
    - Porta local típica do serviço: 3002 (acessado via BFF)

- Function App
  - FinCloud Function (HTTP Trigger) — integração de eventos (deploy em Azure Functions).

## 3 — Endpoints públicos e imagens Docker

Live (publicado):
- FinADM: https://lively-mud-0f74d3610.1.azurestaticapps.net
- FinAPP: https://red-beach-0f53cba10.1.azurestaticapps.net
- FinCloud Function (HTTP Trigger): https://fincloud-a6ckcwfadzhjc0av.canadacentral-01.azurewebsites.net

Docker Hub (imagens públicas):
- User Service: passossss/user-service
- Transaction Service: passossss/transaction-service
- BFF (FinCloud): passossss/bff

GitHub repositories (principais):
- FinCloud (BFF + microservices + functions)
- FinAppPrototype (microfrontend principal)
- FinAdmPrototype (microfrontend administrativo)

github.com/passossss/FinCloud
github.com/passossss/FinAppPrototype
github.com/passossss/FinAdmPrototype

## 4 — Estrutura de pastas (resumo)

- `FinCloud/` — backend: `bff/`, `user-service/`, `transaction-service/`, `docker-compose.yml`, `mongodb-init/`, `sqlserver-init/`.
- `FinAppPrototype/` — frontend cliente (Vite + React + TypeScript).
- `FinAdmPrototype/` — frontend administrativo.

Ver o conteúdo completo das pastas no workspace para detalhes de cada serviço.

## 5 — Como rodar localmente (Windows / PowerShell)

Pré-requisitos
- Node.js (recomendado v18+ / v20+ OK)
- npm ou yarn
- Docker Desktop rodando (Windows)
- PowerShell (o guia usa cmdlets padrão do PowerShell)

1) Subir os bancos via Docker (opcional: usar os containers publicados no Docker Hub para serviços):

```powershell
# Usando docker-compose (traz Mongo e SQL Server configurados no repo)
docker-compose up -d

# Verifique containers
docker ps --filter "name=fin-" -a
```

2) Instalar dependências e iniciar serviços localmente

Observação: cada serviço tem um `package.json` com scripts `dev`/`start`. Abaixo há um fluxo recomendado no mesmo terminal para desenvolvimento (NÃO abre novas janelas):

```powershell
# 1) BFF
Set-Location -Path .\FinCloud\bff
npm install
npm run dev   # nodemon / vite proxy

# 2) User Service
Set-Location -Path ..\user-service
npm install
npm run dev   # tipicamente usa porta 3001

# 3) Transaction Service
Set-Location -Path ..\transaction-service
npm install
npm run dev   # tipicamente usa porta 3002

# 4) Frontends (se desejar rodar apenas o cliente)
Set-Location -Path ..\..\FinAppPrototype
npm install
npm run dev   # Vite no host e porta configurada (5173)

# Para FinAdmPrototype (painel admin)
Set-Location -Path ..\FinAdmPrototype
npm install
npm run dev   # Vite (5174)
```

3) Observação sobre portas
- BFF: http://localhost:3000
- User service (proxied): http://localhost:3001 (via BFF em `/api/users`)
- Transaction service (proxied): http://localhost:3002 (via BFF em `/api/transactions`)
- FinApp: http://localhost:5173
- FinAdm: http://localhost:5174

Se precisar forçar host/porta no Vite, os scripts já estão ajustados para `--host --port 5173` e `5174` respectivamente.

## 6 — Testes rápidos (PowerShell examples)

Use `Invoke-RestMethod` no PowerShell para facilitar JSON e headers.

1) Registrar usuário (exemplo):

```powershell
$body = @{
  name = 'Gustavo'
  email = 'gustavo@example.com'
  password = 'Senha123!'
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/users/register' -Body $body -ContentType 'application/json'
```

2) Logar e obter token

```powershell
$login = @{
  email = 'gustavo@example.com'
  password = 'Senha123!'
} | ConvertTo-Json

$res = Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/users/login' -Body $login -ContentType 'application/json'
$res.token   # guarde para requisições autenticadas
```

3) Criar transação (com token)

```powershell
$token = $res.token
$tx = @{
  userId = '<userId-obtido-no-register-ou-no-token>'
  amount = 49.90
  category = 'food'   # atenção: alinhar categoria com backend; ver seção Troubleshooting
  description = 'Almoço'
  date = (Get-Date).ToString('o')
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/transactions' -Body $tx -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" }
```

4) Listar transações do usuário

```powershell
Invoke-RestMethod -Method Get -Uri 'http://localhost:3000/api/transactions/user/<userId>' -Headers @{ Authorization = "Bearer $token" }
```

Substitua `<userId>` e `$token` conforme retornos reais. Se preferir, use a interface Swagger do BFF (rota `/api/docs`) para testar com botão Authorize.

## 7 — Swagger / OpenAPI

O BFF expõe uma especificação OpenAPI e Swagger UI. Em desenvolvimento, acesse:

- Swagger UI: http://localhost:3000/api/docs
- OpenAPI JSON: http://localhost:3000/api/openapi.json

Use o botão Authorize na interface do Swagger para fornecer o token Bearer (resultado do login) e testar endpoints autenticados diretamente no navegador.

## 8 — CI / CD e Publicação (resumo)

- GitHub Actions: o repositório inclui workflows para build e publicação para Docker Hub e Azure (ver `.github/workflows/`).
- Docker Hub: imagens dos microsserviços e do BFF estão publicadas. O fluxo de CI costuma buildar a imagem e fazer push para `passossss/*`.
- Azure Static Web Apps: frontends são publicados como static apps usando GitHub Actions (ver as URLs públicas fornecidas). 
- Azure Functions: function app publicado em Azure Functions com trigger HTTP (URL pública informada acima).

## 9 — Troubleshooting comum

- Problema: `curl` no PowerShell concatena headers/JSON na URL
  - Solução: use `Invoke-RestMethod` ou `curl.exe` (o alias `curl` no PowerShell chama `Invoke-WebRequest`/`Invoke-RestMethod`).

- Problema: assets `figma:asset/...` não resolvidos no Vite
  - Solução: a base do projeto já converteu esses imports para `src/assets/...`. Se houver novas ocorrências, troque por import relativo ou adicione um plugin/alias no `vite.config.ts`.

- Problema: SQL Server `sqlcmd` não encontrado no container
  - Causa: caminhos do utilitário variam por imagem. Use scripts de inicialização fornecidos (`sqlserver-init/`) ou execute comandos T-SQL via um cliente externo apontando para o container.

- Problema: categorias no front não batem com validação do backend
  - Observação: o front pode enviar nomes em PT (ex.: "Alimentação") enquanto o backend espera chaves EN (ex.: "food"). Soluções:
    1. Normalizar as categorias no frontend (mapear PT -> EN antes de enviar).
    2. Expandir a validação do backend para aceitar ambos os formatos.
    3. Centralizar catálogo de categorias em um endpoint e consumi-lo no front.

## 10 — Boas práticas & next steps sugeridos

- Externalizar configurações sensíveis em arquivos `.env` (não commitar).
- Adicionar um endpoint `/users/me` no BFF para validação de token e recuperação rápida de perfil.
- Centralizar catálogo de categorias em um microserviço/endpoint para evitar desalinhamento entre front e serviços.
- Criar testes automatizados de integração (super-smoke tests) no CI para validar flows: register -> login -> CRUD transações.

## 11 — Contribuidores

- Gustavo Passos
- Rafael Chicovis
- Victor Moro
- Luis Otávio

## 12 — Contato

Para dúvidas e suporte, abra uma issue no repositório FinCloud ou entre em contato com os mantenedores listados acima.

---

Arquivo gerado automaticamente a partir do repositório local em 2025-10-27. Se desejar, adiciono diagramas (C4 / mermaid) e um `README.md` principal com os mesmos conteúdos resumidos para a raiz do projeto.
