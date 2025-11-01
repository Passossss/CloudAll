const express = require('express');
const Joi = require('joi');
const { getTransactionRepository } = require('../config/database');

const router = express.Router();

const { ObjectId } = require('mongodb');

async function findTransactionById(transactionRepo, id) {
  // Try direct id lookup
  let tx = await transactionRepo.findOne({ where: { id } });
  if (tx) return tx;

  // If id looks like an ObjectId, try searching by _id
  try {
    if (ObjectId.isValid(id)) {
      const objId = new ObjectId(id);
      tx = await transactionRepo.findOne({ where: { _id: objId } });
      if (tx) return tx;
    }
  } catch (e) {
    // ignore
  }

  // As a last resort, try matching string version of _id
  try {
    const txs = await transactionRepo.find({ where: {} , take: 1 });
  } catch (e) {
    // ignore
  }

  return null;
}

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

// Schema for updates (partial) - do not allow id or createdAt/updatedAt in payload
const transactionUpdateSchema = Joi.object({
  userId: Joi.string().optional(),
  amount: Joi.number().not(0).optional(),
  description: Joi.string().max(200).optional(),
  category: Joi.string().valid(
    'food', 'transport', 'entertainment', 'shopping', 'bills',
    'health', 'education', 'salary', 'freelance', 'investment',
    'gift', 'other'
  ).optional(),
  type: Joi.string().valid('income', 'expense').optional(),
  date: Joi.date().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  isRecurring: Joi.boolean().optional(),
  recurringPeriod: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').optional()
}).options({ stripUnknown: true });

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

// GET / - list all transactions with pagination (admin)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, category, type } = req.query;
    const transactionRepo = getTransactionRepository();
    const filter = {};
    if (userId) filter.userId = userId;
    if (category) filter.category = category;
    if (type) filter.type = type;

    const take = Math.min(200, parseInt(limit));
    const skip = (parseInt(page) - 1) * take;

    const [transactions, total] = await Promise.all([
      transactionRepo.find({ where: filter, order: { date: 'DESC' }, take, skip }),
      transactionRepo.count({ where: filter })
    ]);

    res.json({
      message: 'Transactions retrieved',
      data: { transactions, pagination: { current: parseInt(page), pages: Math.ceil(total / take), total } }
    });
  } catch (error) {
    console.error('List transactions error:', error);
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
    
    const transaction = await findTransactionById(transactionRepo, id);
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
    const { error: upErr, value: upValue } = transactionUpdateSchema.validate(req.body);
    if (upErr) {
      return res.status(400).json({ error: 'Validation error', details: upErr.details });
    }

    // Normalize amount sign according to type if provided
    if (upValue.type === 'expense' && upValue.amount && upValue.amount > 0) {
      upValue.amount = -Math.abs(upValue.amount);
    } else if (upValue.type === 'income' && upValue.amount && upValue.amount < 0) {
      upValue.amount = Math.abs(upValue.amount);
    }

    const transactionRepo = getTransactionRepository();
    const transaction = await findTransactionById(transactionRepo, id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found', message: 'Transação não encontrada' });
    }

    // Use the stored id if different
    const updateId = transaction.id || id;
    await transactionRepo.update({ id: updateId }, upValue);
    const updated = await findTransactionById(transactionRepo, id);

    res.json({
      message: 'Transaction updated successfully',
      data: { transaction: updated }
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
    
    const transaction = await findTransactionById(transactionRepo, id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found', message: 'Transação não encontrada' });
    }

    await transactionRepo.delete({ id: transaction.id || id });

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
