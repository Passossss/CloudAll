/**
 * Domain Repository Interface
 * Defines the contract for transaction persistence (dependency inversion)
 */
class ITransactionRepository {
  async findById(id) {
    throw new Error('Method not implemented');
  }

  async findByUserId(userId, filters, pagination) {
    throw new Error('Method not implemented');
  }

  async findAll(filters, pagination) {
    throw new Error('Method not implemented');
  }

  async save(transaction) {
    throw new Error('Method not implemented');
  }

  async update(id, data) {
    throw new Error('Method not implemented');
  }

  async delete(id) {
    throw new Error('Method not implemented');
  }

  async count(filters) {
    throw new Error('Method not implemented');
  }
}

module.exports = ITransactionRepository;

