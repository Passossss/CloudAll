const ITransactionRepository = require('../../domain/repositories/ITransactionRepository');
const { getTransactionRepository } = require('../../config/database');
const { ObjectId } = require('mongodb');

/**
 * Infrastructure - Transaction Repository Implementation
 * Implements the domain repository interface using TypeORM/MongoDB
 */
class TransactionRepository extends ITransactionRepository {
  async findById(id) {
    const repo = getTransactionRepository();
    let tx = await repo.findOne({ where: { id } });
    if (tx) return tx;

    // Try ObjectId format
    if (ObjectId.isValid(id)) {
      const objId = new ObjectId(id);
      tx = await repo.findOne({ where: { _id: objId } });
      if (tx) return tx;
    }

    return null;
  }

  async findByUserId(userId, filters = {}, pagination = {}) {
    const repo = getTransactionRepository();
    const { page = 1, limit = 20 } = pagination;
    const filter = { userId, ...filters };

    if (filters.startDate || filters.endDate) {
      filter.date = {};
      if (filters.startDate) filter.date.$gte = new Date(filters.startDate);
      if (filters.endDate) filter.date.$lte = new Date(filters.endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const transactions = await repo.find({
      where: filter,
      order: { date: 'DESC' },
      take: parseInt(limit),
      skip: skip
    });

    const total = await repo.count({ where: filter });
    return { transactions, total, page: parseInt(page), limit: parseInt(limit) };
  }

  async findAll(filters = {}, pagination = {}) {
    const repo = getTransactionRepository();
    const { page = 1, limit = 50 } = pagination;
    const filter = { ...filters };

    const take = Math.min(200, parseInt(limit));
    const skip = (parseInt(page) - 1) * take;

    const [transactions, total] = await Promise.all([
      repo.find({ where: filter, order: { date: 'DESC' }, take, skip }),
      repo.count({ where: filter })
    ]);

    return { transactions, total, page: parseInt(page), limit: take };
  }

  async save(transactionData) {
    const repo = getTransactionRepository();
    const transaction = repo.create(transactionData);
    return await repo.save(transaction);
  }

  async update(id, data) {
    const repo = getTransactionRepository();
    const transaction = await this.findById(id);
    if (!transaction) return null;

    const updateId = transaction.id || id;
    await repo.update({ id: updateId }, data);
    return await this.findById(id);
  }

  async delete(id) {
    const repo = getTransactionRepository();
    const transaction = await this.findById(id);
    if (!transaction) return false;

    await repo.delete({ id: transaction.id || id });
    return true;
  }

  async count(filters = {}) {
    const repo = getTransactionRepository();
    return await repo.count({ where: filters });
  }
}

module.exports = TransactionRepository;

