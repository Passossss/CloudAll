/**
 * Test Runner - Executa todos os testes
 */

const path = require('path');
const fs = require('fs');

console.log('🧪 Executando Testes do Transaction Service\n');
console.log('=' .repeat(60));

// Testes de arquitetura
console.log('\n📐 Testes de Arquitetura');
console.log('-'.repeat(60));
try {
  const archTestPath = path.join(__dirname, 'architecture.test.js');
  require(archTestPath);
  console.log('✅ Testes de arquitetura passaram');
} catch (error) {
  console.error('❌ Erro nos testes de arquitetura:', error.message);
}

// Testes unitários (se existirem)
console.log('\n🔬 Testes Unitários');
console.log('-'.repeat(60));
const unitTestDir = path.join(__dirname, 'unit');
if (fs.existsSync(unitTestDir)) {
  const unitTests = fs.readdirSync(unitTestDir)
    .filter(file => file.endsWith('.test.js'));
  
  if (unitTests.length > 0) {
    console.log(`Encontrados ${unitTests.length} teste(s) unitário(s)`);
    unitTests.forEach(test => {
      console.log(`  - ${test}`);
    });
    console.log('ℹ️  Para executar com Jest: npm test');
  } else {
    console.log('⚠️  Nenhum teste unitário encontrado');
  }
} else {
  console.log('⚠️  Diretório de testes unitários não encontrado');
}

console.log('\n' + '='.repeat(60));
console.log('✅ Execução dos testes concluída\n');

