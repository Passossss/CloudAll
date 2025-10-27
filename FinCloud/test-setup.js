const axios = require('axios');

const services = [
  { name: 'BFF', url: 'http://localhost:3000/api/health' },
  { name: 'User Service', url: 'http://localhost:3001/health' },
  { name: 'Transaction Service', url: 'http://localhost:3002/health' }
];

async function testServices() {
  console.log('🧪 Testando microserviços...\n');

  for (const service of services) {
    try {
      const response = await axios.get(service.url, { timeout: 5000 });
      console.log(`✅ ${service.name}: ${response.status} - ${response.data.status || 'OK'}`);
    } catch (error) {
      console.log(`❌ ${service.name}: ${error.message}`);
    }
  }

  console.log('\n🔍 Testando endpoints principais...\n');

  // Test BFF endpoints
  try {
    const healthResponse = await axios.get('http://localhost:3000/api/health');
    console.log('✅ BFF Health Check:', healthResponse.data);
  } catch (error) {
    console.log('❌ BFF Health Check failed:', error.message);
  }

  // Test user registration
  try {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      age: 25
    };
    
    const registerResponse = await axios.post('http://localhost:3000/api/users/register', userData);
    console.log('✅ User Registration:', registerResponse.data);
  } catch (error) {
    console.log('❌ User Registration failed:', error.response?.data?.error || error.message);
  }

  console.log('\n🎉 Teste concluído!');
  console.log('\n📋 URLs para testar:');
  console.log('- FinApp: http://localhost:5173');
  console.log('- FinAdm: http://localhost:5174');
  console.log('- BFF API: http://localhost:3000/api');
}

testServices().catch(console.error);
