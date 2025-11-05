const express = require('express');
const Joi = require('joi');
const UserController = require('../presentation/controllers/UserController');
const UserRepository = require('../infrastructure/repositories/UserRepository');
const UserProfileRepository = require('../infrastructure/repositories/UserProfileRepository');

const router = express.Router();
const userController = new UserController();
const userRepository = new UserRepository();
const profileRepository = new UserProfileRepository();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).required(),
  age: Joi.number().integer().min(13).max(120).optional(),
  role: Joi.string().valid('normal', 'admin').optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Validation error', details: error.details });
    }
    req.body = value;
    next();
  };
};

// Public routes using Clean Architecture
router.post('/register', validate(registerSchema), (req, res) => userController.register(req, res));
router.post('/login', validate(loginSchema), (req, res) => userController.login(req, res));

// Other routes (legacy - keeping for compatibility)
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userRepository.findById(id);
    if (!user || !user.isActive) {
      return res.status(404).json({ error: 'User not found', message: 'Usuário não encontrado' });
    }

    const profile = await profileRepository.findByUserId(id);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age,
        created_at: user.createdAt,
        profile: {
          monthly_income: profile?.monthlyIncome || 0,
          financial_goals: profile?.financialGoals || null,
          spending_limit: profile?.spendingLimit || 0
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Erro interno do servidor' });
  }
});

router.put('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, monthly_income, financial_goals, spending_limit } = req.body;

    if (name || age !== undefined) {
      await userRepository.update(id, {
        ...(name && { name }),
        ...(age !== undefined && { age })
      });
    }

    if (monthly_income !== undefined || financial_goals !== undefined || spending_limit !== undefined) {
      const profile = await profileRepository.findByUserId(id);
      if (profile) {
        await profileRepository.update(id, {
          ...(monthly_income !== undefined && { monthlyIncome: monthly_income }),
          ...(financial_goals !== undefined && { financialGoals: financial_goals }),
          ...(spending_limit !== undefined && { spendingLimit: spending_limit })
        });
      }
    }

    res.json({ message: 'Profile updated successfully', message_pt: 'Perfil atualizado com sucesso' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Erro interno do servidor' });
  }
});

router.delete('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userRepository.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found', message: 'Usuário não encontrado' });
    }

    await userRepository.delete(id);
    await profileRepository.delete(id);
    return res.status(204).send();
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Erro interno do servidor' });
  }
});

router.get('/stats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userRepository.findById(id);
    if (!user || !user.isActive) {
      return res.status(404).json({ error: 'User not found', message: 'Usuário não encontrado' });
    }

    const profile = await profileRepository.findByUserId(id);
    const daysSince = Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));

    const calculateProfileCompletion = (profile) => {
      if (!profile) return 30;
      let completion = 30;
      if (profile.monthlyIncome > 0) completion += 35;
      if (profile.spendingLimit > 0) completion += 35;
      return Math.min(completion, 100);
    };

    res.json({
      stats: {
        name: user.name,
        member_since: user.createdAt,
        days_active: daysSince,
        monthly_income: profile?.monthlyIncome || 0,
        spending_limit: profile?.spendingLimit || 0,
        profile_completion: calculateProfileCompletion(profile)
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Erro interno do servidor' });
  }
});

// Admin routes
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const result = await userRepository.findAll({}, { page, limit });
    
    const safe = result.users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      age: u.age,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt
    }));

    res.json({
      message: 'Users retrieved',
      data: {
        users: safe,
        pagination: {
          current: result.page,
          pages: Math.ceil(result.total / result.limit),
          total: result.total
        }
      }
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Erro interno do servidor' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userRepository.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found', message: 'Usuário não encontrado' });
    }

    const safe = {
      id: user.id,
      email: user.email,
      name: user.name,
      age: user.age,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    };
    res.json({ message: 'User retrieved', user: safe });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Erro interno do servidor' });
  }
});

router.post('/', validate(registerSchema), async (req, res) => {
  try {
    const result = await userController.register(req, res);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Erro interno do servidor' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age, role } = req.body;

    const user = await userRepository.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found', message: 'Usuário não encontrado' });
    }

    if (name || email || age !== undefined || role) {
      await userRepository.update(id, {
        ...(name && { name }),
        ...(email && { email }),
        ...(age !== undefined && { age }),
        ...(role && { role })
      });
    }

    const updatedUser = await userRepository.findById(id);
    const safe = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      age: updatedUser.age,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt
    };
    res.json({ message: 'User updated successfully', user: safe });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Erro interno do servidor' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userRepository.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found', message: 'Usuário não encontrado' });
    }

    await userRepository.delete(id);
    await profileRepository.delete(id);
    return res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Erro interno do servidor' });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = await userRepository.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found', message: 'Usuário não encontrado' });
    }

    await userRepository.update(id, { isActive: status === 'active' });
    const updatedUser = await userRepository.findById(id);
    const safe = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      age: updatedUser.age,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt
    };
    res.json({ message: 'User status updated', user: safe });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Erro interno do servidor' });
  }
});

router.post('/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const bcrypt = require('bcryptjs');
    
    const user = await userRepository.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found', message: 'Usuário não encontrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userRepository.update(id, { password: hashedPassword });

    res.json({ message: 'Password reset successfully', message_pt: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Erro interno do servidor' });
  }
});

module.exports = router;

