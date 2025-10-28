const express = require('express');
const Joi = require('joi');
const { getTransactionRepository } = require('../config/database');

const router = express.Router();

const transactionSchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().not(0).required(),
  description: Joi.string().max(200).required(),
  category: Joi.string().valid(
    'food', 'transport', 'entertainment', 'shopping', 'bills',
    'health', 'education', 'salary', 'freelance', 'investment',
    'gift', 'other'
  ).required(),
  type: Joi.string().valid('income', 'expense').required(),
  date: Joi.date().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  isRecurring: Joi.boolean().optional(),
  recurringPeriod: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').optional()
});

router.post('/', async (req, res) => {
  try {
    const { error, value } = transactionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Validation error', details: error.details });
    }

    if (value.type === 'expense' && value.amount > 0) {
      value.amount = -Math.abs(value.amount);
    } else if (value.type === 'income' && value.amount < 0) {
      value.amount = Math.abs(value.amount);
    }

    const transactionRepo = getTransactionRepository();
    const transaction = transactionRepo.create(value);
    await transactionRepo.save(transaction);

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Erro interno do servidor' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, category, type, startDate, endDate } = req.query;
    
    const transactionRepo = getTransactionRepository();
    const filter = { userId };

    if (category) filter.category = category;
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const transactions = await transactionRepo.find({
      where: filter,
      order: { date: 'DESC' },
      take: parseInt(limit),
      skip: skip
    });

    const total = await transactionRepo.count({ where: filter });

    res.json({
      transactions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Erro interno do servidor' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transactionRepo = getTransactionRepository();
    
    const transaction = await transactionRepo.findOne({ where: { id } });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found', message: 'Transação não encontrada' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Erro interno do servidor' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = transactionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Validation error', details: error.details });
    }

    if (value.type === 'expense' && value.amount > 0) {
      value.amount = -Math.abs(value.amount);
    } else if (value.type === 'income' && value.amount < 0) {
      value.amount = Math.abs(value.amount);
    }

    const transactionRepo = getTransactionRepository();
    const transaction = await transactionRepo.findOne({ where: { id } });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found', message: 'Transação não encontrada' });
    }

    await transactionRepo.update({ id }, value);
    const updated = await transactionRepo.findOne({ where: { id } });

    res.json({
      message: 'Transaction updated successfully',
      transaction: updated
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Erro interno do servidor' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transactionRepo = getTransactionRepository();
    
    const transaction = await transactionRepo.findOne({ where: { id } });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found', message: 'Transação não encontrada' });
    }

    await transactionRepo.delete({ id });

    res.json({ message: 'Transaction deleted successfully', message_pt: 'Transação excluída com sucesso' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Erro interno do servidor' });
  }
});

router.get('/user/:userId/summary', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = '30d' } = req.query;

    const endDate = new Date();
    const startDate = new Date();
    
    switch(period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const transactionRepo = getTransactionRepository();
    const transactions = await transactionRepo.find({
      where: {
        userId,
        date: { $gte: startDate, $lte: endDate }
      }
    });

    const summary = transactions.reduce((acc, t) => {
      if (!acc[t.type]) {
        acc[t.type] = { total: 0, count: 0 };
      }
      acc[t.type].total += t.amount;
      acc[t.type].count += 1;
      return acc;
    }, {});

    const income = summary.income?.total || 0;
    const expenses = Math.abs(summary.expense?.total || 0);
    const balance = income - expenses;

    const categoryData = transactions.reduce((acc, t) => {
      const key = `${t.category}-${t.type}`;
      if (!acc[key]) {
        acc[key] = { category: t.category, type: t.type, total: 0, count: 0 };
      }
      acc[key].total += Math.abs(t.amount);
      acc[key].count += 1;
      return acc;
    }, {});

    res.json({
      period,
      summary: {
        income,
        expenses,
        balance,
        total_transactions: transactions.length
      },
      categories: Object.values(categoryData).sort((a, b) => b.total - a.total)
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Erro interno do servidor' });
  }
});

router.get('/user/:userId/categories', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = '30d' } = req.query;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));

    const transactionRepo = getTransactionRepository();
    const transactions = await transactionRepo.find({
      where: {
        userId,
        date: { $gte: startDate, $lte: endDate }
      }
    });

    const categoryData = transactions.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { _id: t.category, count: 0, total_amount: 0 };
      }
      acc[t.category].count += 1;
      acc[t.category].total_amount += Math.abs(t.amount);
      return acc;
    }, {});

    const categories = Object.values(categoryData)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Erro interno do servidor' });
  }
});

module.exports = router;
