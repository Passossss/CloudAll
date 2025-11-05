/**
 * Script para executar todos os testes do projeto
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Executando Todos os Testes do Projeto FinCloud\n');
console.log('='.repeat(70));

// Testes do User Service
console.log('\n📦 User Service');
console.log('-'.repeat(70));
try {
  const userServiceTestPath = path.join(__dirname, 'FinCloud', 'user-service', 'src', 'tests', 'run-all-tests.js');
  if (fs.existsSync(userServiceTestPath)) {
    require(userServiceTestPath);
  } else {
    console.log('⚠️  Test runner não encontrado');
  }
} catch (error) {
  console.error('❌ Erro:', error.message);
}

// Testes do Transaction Service
console.log('\n📦 Transaction Service');
console.log('-'.repeat(70));
try {
  const transactionServiceTestPath = path.join(__dirname, 'FinCloud', 'transaction-service', 'src', 'tests', 'run-all-tests.js');
  if (fs.existsSync(transactionServiceTestPath)) {
    require(transactionServiceTestPath);
  } else {
    console.log('⚠️  Test runner não encontrado');
  }
} catch (error) {
  console.error('❌ Erro:', error.message);
}

// Testes de Arquitetura
console.log('\n📐 Validação de Arquitetura');
console.log('-'.repeat(70));

// User Service Architecture
console.log('\n  User Service:');
try {
  const userArchPath = path.join(__dirname, 'FinCloud', 'user-service', 'src', 'tests', 'architecture.test.js');
  if (fs.existsSync(userArchPath)) {
    require(userArchPath);
  }
} catch (error) {
  console.error('  ❌ Erro:', error.message);
}

// Transaction Service Architecture
console.log('\n  Transaction Service:');
try {
  const transactionArchPath = path.join(__dirname, 'FinCloud', 'transaction-service', 'src', 'tests', 'architecture.test.js');
  if (fs.existsSync(transactionArchPath)) {
    require(transactionArchPath);
  }
} catch (error) {
  console.error('  ❌ Erro:', error.message);
}

console.log('\n' + '='.repeat(70));
console.log('✅ Todos os testes foram executados\n');
console.log('💡 Dica: Para testes mais detalhados, execute:');
console.log('   - User Service: cd FinCloud/user-service && npm test');
console.log('   - Transaction Service: cd FinCloud/transaction-service && npm test\n');

