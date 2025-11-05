/**
 * Unit Tests - CreateTransactionUseCase
 */

const CreateTransactionUseCase = require('../../application/features/create-transaction/CreateTransactionUseCase');

// Mock do repositório
class MockTransactionRepository {
  constructor() {
    this.transactions = [];
  }

  async save(transactionData) {
    const transaction = { 
      id: `tx-${Date.now()}`, 
      ...transactionData, 
      createdAt: new Date() 
    };
    this.transactions.push(transaction);
    return transaction;
  }
}

describe('CreateTransactionUseCase - Unit Tests', () => {
  let useCase;
  let transactionRepository;

  beforeEach(() => {
    transactionRepository = new MockTransactionRepository();
    useCase = new CreateTransactionUseCase(transactionRepository);
  });

  it('should create income transaction with positive amount', async () => {
    const transactionData = {
      userId: 'user-123',
      amount: 1000,
      description: 'Salary',
      category: 'salary',
      type: 'income'
    };

    const result = await useCase.execute(transactionData);

    expect(result).toBeDefined();
    expect(result.type).toBe('income');
    expect(result.amount).toBeGreaterThan(0);
    expect(result.userId).toBe(transactionData.userId);
  });

  it('should normalize expense to negative amount', async () => {
    const transactionData = {
      userId: 'user-123',
      amount: 500, // Positive, but should be negative
      description: 'Shopping',
      category: 'shopping',
      type: 'expense'
    };

    const result = await useCase.execute(transactionData);

    expect(result.type).toBe('expense');
    expect(result.amount).toBeLessThan(0);
    expect(Math.abs(result.amount)).toBe(500);
  });

  it('should normalize income to positive amount', async () => {
    const transactionData = {
      userId: 'user-123',
      amount: -1000, // Negative, but should be positive
      description: 'Salary',
      category: 'salary',
      type: 'income'
    };

    const result = await useCase.execute(transactionData);

    expect(result.type).toBe('income');
    expect(result.amount).toBeGreaterThan(0);
    expect(result.amount).toBe(1000);
  });

  it('should preserve negative amount for expenses', async () => {
    const transactionData = {
      userId: 'user-123',
      amount: -500, // Already negative
      description: 'Shopping',
      category: 'shopping',
      type: 'expense'
    };

    const result = await useCase.execute(transactionData);

    expect(result.type).toBe('expense');
    expect(result.amount).toBeLessThan(0);
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
    toBeGreaterThan: (num) => {
      if (value <= num) throw new Error(`Expected ${value} to be greater than ${num}`);
    },
    toBeLessThan: (num) => {
      if (value >= num) throw new Error(`Expected ${value} to be less than ${num}`);
    }
  });

  console.log('Note: Full unit tests require Jest. Run with: npm test');
}

module.exports = { describe, it, expect, beforeEach };

