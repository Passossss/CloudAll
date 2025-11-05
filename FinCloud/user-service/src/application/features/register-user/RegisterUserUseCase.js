const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../../../infrastructure/repositories/UserRepository');
const UserProfileRepository = require('../../../infrastructure/repositories/UserProfileRepository');

/**
 * Application Layer - Use Case: Register User
 * Implements the business logic for user registration
 */
class RegisterUserUseCase {
  constructor(userRepository = null, profileRepository = null) {
    this.userRepository = userRepository || new UserRepository();
    this.profileRepository = profileRepository || new UserProfileRepository();
  }

  async execute(userData) {
    const { email, password, name, age, role } = userData;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.userRepository.save({
      email,
      password: hashedPassword,
      name,
      age: age || null,
      role: role || 'normal',
      isActive: true
    });

    // Create profile
    await this.profileRepository.save({
      userId: user.id,
      monthlyIncome: 0,
      spendingLimit: 0
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age,
        role: user.role
      },
      token
    };
  }
}

module.exports = RegisterUserUseCase;

