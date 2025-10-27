const fs = require('fs');
const path = require('path');

// Configurações para cada serviço
const envConfigs = {
  bff: {
    PORT: '3000',
    NODE_ENV: 'development',
    FRONTEND_URL: 'http://localhost:5173',
    USER_SERVICE_URL: 'http://localhost:3001',
    TRANSACTION_SERVICE_URL: 'http://localhost:3002'
  },
  'user-service': {
    PORT: '3001',
    NODE_ENV: 'development',
    JWT_SECRET: 'fin_app_super_secret_jwt_key_2024',
    DB_SERVER: 'localhost',
    DB_NAME: 'fin_users_db',
    DB_USER: 'sa',
    DB_PASSWORD: 'FinApp123!',
    DB_PORT: '1433',
    DB_ENCRYPT: 'true',
    DB_TRUST_SERVER_CERTIFICATE: 'true'
  },
  'transaction-service': {
    PORT: '3002',
    NODE_ENV: 'development',
    MONGODB_URI: 'mongodb://finuser:FinApp123!@localhost:27017/fin_transactions?authSource=admin'
  }
};

// Criar arquivos .env para cada serviço
Object.entries(envConfigs).forEach(([service, config]) => {
  const envPath = path.join(__dirname, service, '.env');
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Created .env for ${service}`);
});

console.log('\n🎉 All .env files created successfully!');
console.log('\n📋 Next steps:');
console.log('1. Run: docker-compose up -d');
console.log('2. Wait for databases to be ready');
console.log('3. Run: npm run dev');
