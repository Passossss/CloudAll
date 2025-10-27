# Comandos de Criação dos Artefatos

Este arquivo contém os comandos reais para gerar cada projeto do microfrontend, microservices, function e BFF.

## Microservices

### Microservice 1 (MongoDB Atlas)
```
# Criação do projeto Node.js
mkdir microservices/microservice-mongo
cd microservices/microservice-mongo
npm init -y
npm install express mongoose cors dotenv
```

### Microservice 2 (Azure SQL Server)
```
# Criação do projeto Node.js
mkdir microservices/microservice-azure-sql
cd microservices/microservice-azure-sql
npm init -y
npm install express mssql cors dotenv
```

## Function (Exemplo Azure Function)
```
# Instalar Azure Functions Core Tools
npm install -g azure-functions-core-tools@4 --unsafe-perm true
# Criar Function
mkdir function
cd function
func init --worker-runtime node
func new --name HttpExample --template "HTTP trigger"
```

## BFF (Backend For Frontend)
```
mkdir bff
cd bff
npm init -y
npm install express cors dotenv
```

## Publicação no GitHub
```
# Inicializar repositório Git
cd <diretório do projeto>
git init
git remote add origin https://github.com/<usuario>/<repo>.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

## Publicação no Docker Hub
```
# Build da imagem
cd <diretório do projeto>
docker build -t <usuario>/<repo>:<tag> .
# Login no Docker Hub
docker login
# Push da imagem
docker push <usuario>/<repo>:<tag>
```

## Observações
- Substitua `<usuario>`, `<repo>`, `<tag>` pelos seus dados reais.
- Configure variáveis de ambiente para acesso ao MongoDB Atlas e Azure SQL Server.
- Documente os links dos artefatos no arquivo Markdown para AVA.
