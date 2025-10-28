const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { getUserRepository, getUserProfileRepository } = require('../config/database');

const router = express.Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).required(),
  age: Joi.number().integer().min(13).max(120).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Validation error', details: error.details });
    }

    const { email, password, name, age } = value;
    const userRepo = getUserRepository();
    const profileRepo = getUserProfileRepository();

    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists', message: 'Usuário já cadastrado com este email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = userRepo.create({
      email,
      password: hashedPassword,
      name,
      age: age || null,
      isActive: true
    });
    
    await userRepo.save(user);

    const profile = profileRepo.create({
      userId: user.id,
      monthlyIncome: 0,
      spendingLimit: 0
    });
    await profileRepo.save(profile);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, email: user.email, name: user.name, age: user.age },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Erro interno do servidor' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Validation error', details: error.details });
    }

    const { email, password } = value;
    const userRepo = getUserRepository();

    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials', message: 'Email ou senha incorretos' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account inactive', message: 'Conta desativada' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials', message: 'Email ou senha incorretos' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name, age: user.age },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Erro interno do servidor' });
  }
});

router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userRepo = getUserRepository();
    const profileRepo = getUserProfileRepository();

    const user = await userRepo.findOne({ where: { id, isActive: true } });
    if (!user) {
      return res.status(404).json({ error: 'User not found', message: 'Usuário não encontrado' });
    }

    const profile = await profileRepo.findOne({ where: { userId: id } });

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
    const userRepo = getUserRepository();
    const profileRepo = getUserProfileRepository();

    if (name || age !== undefined) {
      await userRepo.update({ id }, { 
        ...(name && { name }),
        ...(age !== undefined && { age })
      });
    }

    if (monthly_income !== undefined || financial_goals !== undefined || spending_limit !== undefined) {
      const profile = await profileRepo.findOne({ where: { userId: id } });
      if (profile) {
        await profileRepo.update({ userId: id }, {
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

router.get('/stats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userRepo = getUserRepository();
    const profileRepo = getUserProfileRepository();

    const user = await userRepo.findOne({ where: { id, isActive: true } });
    if (!user) {
      return res.status(404).json({ error: 'User not found', message: 'Usuário não encontrado' });
    }

    const profile = await profileRepo.findOne({ where: { userId: id } });
    const daysSince = Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));

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

function calculateProfileCompletion(profile) {
  if (!profile) return 30;
  let completion = 30;
  if (profile.monthlyIncome > 0) completion += 35;
  if (profile.spendingLimit > 0) completion += 35;
  return Math.min(completion, 100);
}

module.exports = router;
