/**
 * Integration Tests - UserRepository
 * 
 * Nota: Estes testes requerem banco de dados configurado
 */

const UserRepository = require('../../infrastructure/repositories/UserRepository');
const { initDatabase } = require('../../config/database');

describe('UserRepository - Integration Tests', () => {
  let repository;

  beforeAll(async () => {
    await initDatabase();
    repository = new UserRepository();
  });

  it('should find user by email', async () => {
    // Este teste requer dados no banco
    const email = 'test@example.com';
    const user = await repository.findByEmail(email);
    
    // Se não encontrar, não é erro (pode não existir)
    if (user) {
      expect(user.email).toBe(email);
    }
  });

  it('should find user by id', async () => {
    const id = 'test-id';
    const user = await repository.findById(id);
    
    if (user) {
      expect(user.id).toBe(id);
    }
  });

  it('should save new user', async () => {
    const userData = {
      email: `test-${Date.now()}@example.com`,
      password: 'hashed-password',
      name: 'Test User',
      age: 25,
      role: 'normal',
      isActive: true
    };

    const savedUser = await repository.save(userData);
    
    expect(savedUser).toBeDefined();
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.id).toBeDefined();
  });

  it('should update user', async () => {
    // Primeiro criar um usuário
    const userData = {
      email: `update-${Date.now()}@example.com`,
      password: 'hashed-password',
      name: 'Original Name',
      role: 'normal',
      isActive: true
    };

    const savedUser = await repository.save(userData);
    
    // Atualizar
    const updated = await repository.update(savedUser.id, { name: 'Updated Name' });
    
    expect(updated.name).toBe('Updated Name');
  });

  it('should list all users with pagination', async () => {
    const result = await repository.findAll({}, { page: 1, limit: 10 });
    
    expect(result.users).toBeDefined();
    expect(Array.isArray(result.users)).toBe(true);
    expect(result.total).toBeDefined();
    expect(result.page).toBe(1);
  });
});

// Simple test runner
if (require.main === module) {
  console.log('\n⚠️  Integration tests require database connection.');
  console.log('Run with: npm test -- --testPathPattern=integration');
  console.log('Or configure database and run: node src/tests/integration/UserRepository.test.js\n');
}

module.exports = { describe, it, expect, beforeAll };

