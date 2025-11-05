const { getUserProfileRepository } = require('../../config/database');

/**
 * Infrastructure - User Profile Repository
 */
class UserProfileRepository {
  async findByUserId(userId) {
    const repo = getUserProfileRepository();
    return await repo.findOne({ where: { userId } });
  }

  async save(profileData) {
    const repo = getUserProfileRepository();
    const profile = repo.create(profileData);
    return await repo.save(profile);
  }

  async update(userId, data) {
    const repo = getUserProfileRepository();
    await repo.update({ userId }, data);
    return await repo.findOne({ where: { userId } });
  }

  async delete(userId) {
    const repo = getUserProfileRepository();
    await repo.delete({ userId });
    return true;
  }
}

module.exports = UserProfileRepository;

