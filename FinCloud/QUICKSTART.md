# 🚀 Quick Start - Fin App

## Inicialização Rápida

### 1. Pré-requisitos
- Docker Desktop instalado e rodando
- Node.js 18+ instalado

### 2. Executar Setup Automático

**Windows:**
```cmd
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

### 3. Iniciar Microserviços
```bash
npm run dev
```

### 4. Acessar Aplicações
- **FinApp (Usuário):** http://localhost:5173
- **FinAdm (Admin):** http://localhost:5174

## 🔧 Comandos Úteis

```bash
# Configurar .env files
npm run setup

# Testar serviços
npm test

# Parar bancos de dados
docker-compose down

# Ver logs dos bancos
docker-compose logs -f

# Reinstalar dependências
npm run install-all
```

## 🐛 Troubleshooting

### Docker não está rodando
- Inicie o Docker Desktop
- Verifique se está rodando: `docker info`

### Porta já em uso
- Pare outros serviços nas portas 3000, 3001, 3002, 1433, 27017
- Ou altere as portas no docker-compose.yml

### Erro de conexão com banco
- Aguarde 30 segundos após `docker-compose up -d`
- Verifique se os containers estão rodando: `docker ps`

## 📊 Estrutura do Projeto

```
FinCloud/
├── bff/                    # Backend for Frontend
├── user-service/           # Serviço de usuários (SQL Server)
├── transaction-service/    # Serviço de transações (MongoDB)
├── docker-compose.yml      # Configuração dos bancos
├── start.bat/.sh          # Scripts de inicialização
└── test-setup.js          # Script de teste
```

## 🔗 URLs dos Serviços

- **BFF:** http://localhost:3000
- **User Service:** http://localhost:3001
- **Transaction Service:** http://localhost:3002
- **SQL Server:** localhost:1433
- **MongoDB:** localhost:27017
