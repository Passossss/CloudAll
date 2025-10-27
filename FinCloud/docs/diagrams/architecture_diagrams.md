# Diagramas de Arquitetura (Mermaid)

Este arquivo contém diagramas Mermaid simples (C4-like) para ajudar na comunicação arquitetural. Você pode visualizar estes diagramas no GitHub ou em um renderer compatível com Mermaid.

## C4 — System Context

```mermaid
flowchart LR
  subgraph UX [Microfrontends]
    FinAPP["FinAPP\n(Microfrontend - React/Vite)"]
    FinADM["FinADM\n(Microfrontend - React/Vite)"]
  end

  BFF["FinCloud BFF\n(Backend for Frontend - Node/Express)"]
  UserSvc["User Service\n(Microservice)"]
  TxSvc["Transaction Service\n(Microservice)"]
  Func["FinCloud Function\n(HTTP Trigger)"]

  Mongo[(MongoDB)]
  SQL[(Azure SQL / SQL Server)]

  FinAPP -->|HTTP /api| BFF
  FinADM -->|HTTP /api| BFF
  BFF -->|proxied HTTP| UserSvc
  BFF -->|proxied HTTP| TxSvc
  BFF -->|event / HTTP| Func
  UserSvc -->|persist| SQL
  TxSvc -->|persist| Mongo

  classDef infra fill:#f8f9fa,stroke:#ccc
  class Mongo,SQL infra
```

## C4 — Container Diagram (detalhado)

```mermaid
flowchart TB
  subgraph Frontends
    A[FinAPP<br/>5173]
    B[FinADM<br/>5174]
  end

  subgraph Backend
    direction TB
    C[BFF - Node.js/Express<br/>3000]
    D[User Service - Node.js<br/>3001]
    E[Transaction Service - Node.js<br/>3002]
    F[Function App - Azure Functions]
  end

  subgraph Datastores
    G[(Azure SQL / SQL Server 1433)]
    H[(MongoDB 27017)]
  end

  A --> C
  B --> C
  C --> D
  C --> E
  C --> F
  D --> G
  E --> H

  click C "../bff/" "Abrir código do BFF"
  click D "../user-service/" "Abrir código do User Service"
  click E "../transaction-service/" "Abrir código do Transaction Service"
```

Observações

- Os diagramas são propositalmente simples — servem como mapa rápido.
- Se preferir, posso gerar diagramas C4 mais formais (levels: contexto, container, component) ou exportar PNG/SVG.
