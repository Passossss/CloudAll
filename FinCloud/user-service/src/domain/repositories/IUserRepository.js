/**
 * Domain Repository Interface
 * Defines the contract for user persistence (dependency inversion)
 */
class IUserRepository {
  async findById(id) {
    throw new Error('Method not implemented');
  }

  async findByEmail(email) {
    throw new Error('Method not implemented');
  }

  async findAll(filters, pagination) {
    throw new Error('Method not implemented');
  }

  async save(user) {
    throw new Error('Method not implemented');
  }

  async update(id, data) {
    throw new Error('Method not implemented');
  }

  async delete(id) {
    throw new Error('Method not implemented');
  }
}

module.exports = IUserRepository;

