const TransactionRepository = require('../../../infrastructure/repositories/TransactionRepository');

/**
 * Application Layer - Use Case: Update Transaction
 */
class UpdateTransactionUseCase {
  constructor(transactionRepository = null) {
    this.transactionRepository = transactionRepository || new TransactionRepository();
  }

  async execute(id, updateData) {
    // Normalize amount if provided
    if (updateData.type === 'expense' && updateData.amount && updateData.amount > 0) {
      updateData.amount = -Math.abs(updateData.amount);
    } else if (updateData.type === 'income' && updateData.amount && updateData.amount < 0) {
      updateData.amount = Math.abs(updateData.amount);
    }

    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return await this.transactionRepository.update(id, updateData);
  }
}

module.exports = UpdateTransactionUseCase;

