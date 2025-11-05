const RegisterUserUseCase = require('../../application/features/register-user/RegisterUserUseCase');
const LoginUserUseCase = require('../../application/features/login-user/LoginUserUseCase');
const UserRepository = require('../../infrastructure/repositories/UserRepository');
const UserProfileRepository = require('../../infrastructure/repositories/UserProfileRepository');

/**
 * Presentation Layer - User Controller
 * Handles HTTP requests and delegates to use cases
 */
class UserController {
  constructor() {
    this.userRepository = new UserRepository();
    this.profileRepository = new UserProfileRepository();
    this.registerUseCase = new RegisterUserUseCase(this.userRepository, this.profileRepository);
    this.loginUseCase = new LoginUserUseCase(this.userRepository);
  }

  async register(req, res) {
    try {
      const result = await this.registerUseCase.execute(req.body);
      res.status(201).json({
        message: 'User created successfully',
        ...result
      });
    } catch (error) {
      if (error.message === 'User already exists') {
        return res.status(409).json({
          error: 'User already exists',
          message: 'Usuário já cadastrado com este email'
        });
      }
      console.error('Register error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Erro interno do servidor'
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await this.loginUseCase.execute(email, password);
      res.json({
        message: 'Login successful',
        ...result
      });
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email ou senha incorretos'
        });
      }
      if (error.message === 'Account inactive') {
        return res.status(403).json({
          error: 'Account inactive',
          message: 'Conta desativada'
        });
      }
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = UserController;

