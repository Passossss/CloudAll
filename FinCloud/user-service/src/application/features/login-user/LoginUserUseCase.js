const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../../../infrastructure/repositories/UserRepository');

/**
 * Application Layer - Use Case: Login User
 * Implements the business logic for user authentication
 */
class LoginUserUseCase {
  constructor(userRepository = null) {
    this.userRepository = userRepository || new UserRepository();
  }

  async execute(email, password) {
    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new Error('Account inactive');
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

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

module.exports = LoginUserUseCase;

