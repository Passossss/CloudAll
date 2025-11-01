🧩 Projeto PJBL — Arquitetura de Microsserviços e Microfrontends

👨‍💻 Equipe

- Gustavo Passos
- Rafael Chicovis
- Victor Moro
- Luis Otávio

🚀 Visão Geral do Projeto

O projeto FinCloud foi desenvolvido com base em uma arquitetura de microsserviços, funções serverless e microfrontends, integrados por um BFF (Backend for Frontend) em Node.js.
O objetivo é demonstrar o uso de múltiplos bancos de dados, integração entre serviços e publicação de aplicações em ambientes distribuídos (GitHub, Docker Hub e Azure).

🧱 Estrutura dos Componentes

| Tipo | Nome | Descrição | Banco de Dados |
|------|------|-----------|----------------|
| 🧩 Microserviço 1 | User Service | Gerencia informações de usuários | MongoDB Atlas |
| 🧩 Microserviço 2 | Transaction Service | Gerencia transações financeiras | Azure SQL Server (1 DTU) |
| 🔁 BFF (Backend for Frontend) | FinCloud BFF | Agrega dados do User Service, Transaction Service e Function; realiza CRUD e integração via HTTP Trigger | - |
| ☁️ Function | FinCloud Function App | Recebe eventos HTTP e persiste informações no banco de dados | - |
| 💻 Microfrontend 1 | FinADM | Painel administrativo para gestão de dados do sistema | - |
| 💻 Microfrontend 2 | FinAPP | Aplicativo principal voltado ao usuário final | - |

🌐 Endpoints e Publicações

🔸 Microfrontends (prod/public)

- FinADM: https://lively-mud-0f74d3610.1.azurestaticapps.net
- FinAPP: https://red-beach-0f53cba10.1.azurestaticapps.net

🔸 Function App

- FinCloud Function: https://fincloud-a6ckcwfadzhjc0av.canadacentral-01.azurewebsites.net

github.com/passossss/FinCloud
github.com/passossss/FinAppPrototype
github.com/passossss/FinAdmPrototype


docs da atividade:
https://pucpredu-my.sharepoint.com/:f:/g/personal/otavio_l_pucpr_edu_br/ElATc2p9FoZGlDt1sIFDqzwBFtPTjKzHBu7-F3p5fLKKIg?e=lAgWB4

🐳 Docker Hub

Repositórios públicos (images):

- User Service: passossss/user-service
- Transaction Service: passossss/transaction-service
- BFF (FinCloud): passossss/bff

Comandos rápidos para pull:

```powershell
docker pull passossss/user-service
docker pull passossss/transaction-service
docker pull passossss/bff
```

💾 GitHub

- FinCloud — Contém os 3 microsserviços (BFF + Services + Functions) — JavaScript
- FinAppPrototype — Microfrontend principal — TypeScript
- FinAdmPrototype — Microfrontend administrativo — TypeScript

⚙️ Docker

Cada microsserviço e o BFF possuem um Dockerfile configurado e publicado no Docker Hub. Use `docker-compose.yml` (em `FinCloud/`) para levantar dependências locais (MongoDB, SQL Server) durante desenvolvimento.

🧭 Documentação Arquitetural

- Modelos: C4, Arc42, Software Architecture Canvas
- Local (no repositório): `FinCloud/docs/` — inclui diagramas em Mermaid (`docs/diagrams/architecture_diagrams.md`).

🔗 Integrações

- O BFF realiza agregação de dados entre os microsserviços e a Function App.
- O BFF expõe endpoints REST para CRUD e eventos HTTP que acionam a Function.
- A Function recebe eventos e persiste dados no banco de dados.

🧠 Tecnologias Utilizadas

- Node.js
- Express.js
- Azure Functions (HTTP Trigger)
- MongoDB Atlas
- Azure SQL Server (1 DTU)
- Docker
- GitHub Actions
- Azure Static Web Apps
- Microfrontends com TypeScript / React (Vite)

📅 Status

✅ Todos os microsserviços, BFF, functions e microfrontends estão publicados e integrados (URLs e imagens listadas acima).