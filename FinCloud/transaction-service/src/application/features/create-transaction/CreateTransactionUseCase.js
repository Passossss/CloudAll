const TransactionRepository = require('../../../infrastructure/repositories/TransactionRepository');

/**
 * Application Layer - Use Case: Create Transaction
 * Implements the business logic for transaction creation
 */
class CreateTransactionUseCase {
  constructor(transactionRepository = null) {
    this.transactionRepository = transactionRepository || new TransactionRepository();
  }

  async execute(transactionData) {
    // Normalize amount based on type
    if (transactionData.type === 'expense' && transactionData.amount > 0) {
      transactionData.amount = -Math.abs(transactionData.amount);
    } else if (transactionData.type === 'income' && transactionData.amount < 0) {
      transactionData.amount = Math.abs(transactionData.amount);
    }

    const transaction = await this.transactionRepository.save(transactionData);
    return transaction;
  }
}

module.exports = CreateTransactionUseCase;

