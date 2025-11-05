/**
 * Unit Tests - RegisterUserUseCase
 */

const RegisterUserUseCase = require('../../application/features/register-user/RegisterUserUseCase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock do repositório
class MockUserRepository {
  constructor() {
    this.users = [];
  }

  async findByEmail(email) {
    return this.users.find(u => u.email === email) || null;
  }

  async save(userData) {
    const user = { id: 'test-id', ...userData, createdAt: new Date() };
    this.users.push(user);
    return user;
  }
}

class MockProfileRepository {
  async save(profileData) {
    return { id: 'profile-id', ...profileData };
  }
}

describe('RegisterUserUseCase - Unit Tests', () => {
  let useCase;
  let userRepository;
  let profileRepository;

  beforeEach(() => {
    userRepository = new MockUserRepository();
    profileRepository = new MockProfileRepository();
    useCase = new RegisterUserUseCase(userRepository, profileRepository);
  });

  it('should register a new user successfully', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      age: 25
    };

    const result = await useCase.execute(userData);

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(userData.email);
    expect(result.token).toBeDefined();
    expect(result.user.id).toBeDefined();
  });

  it('should throw error if user already exists', async () => {
    const userData = {
      email: 'existing@example.com',
      password: 'password123',
      name: 'Existing User'
    };

    // Primeiro registro
    await useCase.execute(userData);

    // Tentativa de registro duplicado
    try {
      await useCase.execute(userData);
      throw new Error('Should have thrown error');
    } catch (error) {
      expect(error.message).toBe('User already exists');
    }
  });

  it('should hash password before saving', async () => {
    const userData = {
      email: 'hash@example.com',
      password: 'password123',
      name: 'Hash User'
    };

    const result = await useCase.execute(userData);
    const savedUser = userRepository.users.find(u => u.email === userData.email);
    
    expect(savedUser.password).not.toBe(userData.password);
    expect(savedUser.password).toHaveLength(60); // bcrypt hash length
  });

  it('should create profile for new user', async () => {
    const userData = {
      email: 'profile@example.com',
      password: 'password123',
      name: 'Profile User'
    };

    const saveSpy = jest.spyOn(profileRepository, 'save');
    await useCase.execute(userData);

    expect(saveSpy).toHaveBeenCalledWith({
      userId: expect.any(String),
      monthlyIncome: 0,
      spendingLimit: 0
    });
  });

  it('should generate JWT token', async () => {
    const userData = {
      email: 'token@example.com',
      password: 'password123',
      name: 'Token User'
    };

    const result = await useCase.execute(userData);
    
    expect(result.token).toBeDefined();
    // Verificar que o token é válido
    const decoded = jwt.verify(result.token, process.env.JWT_SECRET || 'fallback_secret');
    expect(decoded.userId).toBe(result.user.id);
    expect(decoded.email).toBe(userData.email);
  });
});

// Simple test runner
if (require.main === module) {
  const describe = (name, fn) => {
    console.log(`\n✓ ${name}`);
    fn();
  };

  const it = (name, fn) => {
    try {
      fn();
      console.log(`  ✓ ${name}`);
    } catch (error) {
      console.error(`  ✗ ${name}: ${error.message}`);
    }
  };

  const beforeEach = (fn) => {
    fn();
  };

  const expect = (value) => ({
    toBeDefined: () => {
      if (value === undefined) throw new Error('Expected value to be defined');
    },
    toBe: (expected) => {
      if (value !== expected) throw new Error(`Expected ${value} to be ${expected}`);
    },
    toHaveLength: (length) => {
      if (value.length !== length) throw new Error(`Expected length ${length}, got ${value.length}`);
    },
    not: {
      toBe: (notExpected) => {
        if (value === notExpected) throw new Error(`Expected ${value} not to be ${notExpected}`);
      }
    }
  });

  const jest = {
    spyOn: (obj, method) => ({
      toHaveBeenCalledWith: (...args) => {
        // Simple spy check
        console.log(`  Spy called with:`, args);
      }
    })
  };

  // Run tests
  describe('RegisterUserUseCase - Unit Tests', () => {
    console.log('Note: Full unit tests require Jest. Run with: npm test');
  });
}

module.exports = { describe, it, expect, beforeEach, jest };

