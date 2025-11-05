# MongoDB Azure Function

Azure Function para operações CRUD no MongoDB.

## 📋 Funcionalidades

- ✅ **CREATE** - Inserir documentos (único ou múltiplo)
- ✅ **READ** - Buscar documentos (por ID ou com filtros)
- ✅ **UPDATE** - Atualizar documentos
- ✅ **DELETE** - Deletar documentos
- ✅ **Connection Pooling** - Reutilização de conexões
- ✅ **Sanitização** - Proteção contra injection
- ✅ **Validação** - Validação de ObjectId e dados
- ✅ **Tratamento de Erros** - Mensagens de erro detalhadas

## 🚀 Uso

### Variáveis de Ambiente

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/
MONGODB_DATABASE=fincloud
```

### Endpoints

#### POST - Criar Documento

```bash
POST /api/mongodb?collection=transactions
Content-Type: application/json

{
  "data": {
    "userId": "user-123",
    "amount": 1000,
    "description": "Salary",
    "type": "income"
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Document created successfully",
  "insertedId": "...",
  "insertedCount": 1,
  "data": { ... }
}
```

#### GET - Buscar Documento por ID

```bash
GET /api/mongodb?collection=transactions&id=507f1f77bcf86cd799439011
```

#### GET - Buscar Múltiplos Documentos

```bash
GET /api/mongodb?collection=transactions&limit=10&skip=0&filter={"userId":"user-123"}
```

**Query Parameters:**
- `collection` - Nome da collection (obrigatório)
- `id` - ID do documento (opcional, para buscar único)
- `filter` - Filtro JSON (opcional)
- `limit` - Limite de resultados (padrão: 100, máximo: 1000)
- `skip` - Número de documentos a pular (padrão: 0)
- `sort` - Ordenação JSON (opcional)

#### PUT - Atualizar Documento

```bash
PUT /api/mongodb?collection=transactions&id=507f1f77bcf86cd799439011
Content-Type: application/json

{
  "data": {
    "amount": 1500,
    "description": "Updated Salary"
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Document updated successfully",
  "matchedCount": 1,
  "modifiedCount": 1,
  "data": { ... }
}
```

#### DELETE - Deletar Documento

```bash
DELETE /api/mongodb?collection=transactions&id=507f1f77bcf86cd799439011
```

**Resposta:**
```json
{
  "success": true,
  "message": "Document deleted successfully",
  "deletedCount": 1,
  "deletedDocument": { ... }
}
```

## 🔒 Segurança

- **Sanitização de Collection Names**: Remove caracteres especiais
- **Validação de ObjectId**: Valida formato antes de usar
- **Connection Pooling**: Limita conexões simultâneas
- **Limite de Documentos**: Máximo 100 documentos por inserção
- **Limite de Resultados**: Máximo 1000 documentos por query

## ⚠️ Tratamento de Erros

A função retorna códigos HTTP apropriados:

- `400` - Bad Request (dados inválidos)
- `404` - Not Found (documento não encontrado)
- `409` - Conflict (chave duplicada)
- `500` - Internal Server Error
- `503` - Service Unavailable (erro de conexão)

## 📝 Exemplos

### Criar Múltiplos Documentos

```bash
POST /api/mongodb?collection=transactions
Content-Type: application/json

{
  "data": [
    { "userId": "user-1", "amount": 100 },
    { "userId": "user-2", "amount": 200 }
  ]
}
```

### Buscar com Filtro e Ordenação

```bash
GET /api/mongodb?collection=transactions&filter={"type":"income"}&sort={"amount":-1}&limit=5
```

### Atualizar com Body

```bash
PUT /api/mongodb?collection=transactions
Content-Type: application/json

{
  "id": "507f1f77bcf86cd799439011",
  "data": {
    "amount": 2000
  }
}
```

