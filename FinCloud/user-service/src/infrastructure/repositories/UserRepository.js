const IUserRepository = require('../../domain/repositories/IUserRepository');
const { getUserRepository, getUserProfileRepository } = require('../../config/database');

/**
 * Infrastructure - User Repository Implementation
 * Implements the domain repository interface using TypeORM
 */
class UserRepository extends IUserRepository {
  async findById(id) {
    const repo = getUserRepository();
    return await repo.findOne({ where: { id } });
  }

  async findByEmail(email) {
    const repo = getUserRepository();
    return await repo.findOne({ where: { email } });
  }

  async findAll(filters = {}, pagination = {}) {
    const repo = getUserRepository();
    const { page = 1, limit = 50 } = pagination;
    const take = Math.min(200, parseInt(limit));
    const skip = (parseInt(page) - 1) * take;

    const [users, total] = await Promise.all([
      repo.find({ where: filters, take, skip, order: { createdAt: 'DESC' } }),
      repo.count({ where: filters })
    ]);

    return { users, total, page: parseInt(page), limit: take };
  }

  async save(userData) {
    const repo = getUserRepository();
    const user = repo.create(userData);
    return await repo.save(user);
  }

  async update(id, data) {
    const repo = getUserRepository();
    await repo.update({ id }, data);
    return await repo.findOne({ where: { id } });
  }

  async delete(id) {
    const repo = getUserRepository();
    await repo.update({ id }, { isActive: false });
    return true;
  }
}

module.exports = UserRepository;

