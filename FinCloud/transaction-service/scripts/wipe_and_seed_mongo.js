#!/usr/bin/env node
require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://finuser:FinApp123!@localhost:27017/?authSource=admin';
const DB_NAME = process.env.MONGO_DB || 'fin_transactions';

async function run() {
  const client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    console.log('Dropping transactions and categories collections (if exist)...');
    await db.collection('transactions').deleteMany({});
    await db.collection('categories').deleteMany({});

    console.log('Inserting base categories...');
    await db.collection('categories').insertMany([
      { key: 'shopping', name: 'Compras' },
      { key: 'salary', name: 'Salário' },
      { key: 'food', name: 'Alimentação' }
    ]);

    console.log('Inserting two sample transactions for test users...');
    const now = new Date();
    await db.collection('transactions').insertMany([
      {
        userId: '11111111-1111-1111-1111-111111111111',
        amount: 1000.0,
        type: 'income',
        description: 'Salary (seed)',
        category: 'salary',
        date: now,
        createdAt: now
      },
      {
        userId: '22222222-2222-2222-2222-222222222222',
        amount: -50.0,
        type: 'expense',
        description: 'Grocery (seed)',
        category: 'food',
        date: now,
        createdAt: now
      }
    ]);

    console.log('Mongo wipe-and-seed completed.');
    process.exit(0);
  } catch (err) {
    console.error('Error during Mongo wipe-and-seed:', err);
    process.exit(1);
  } finally {
    try { await client.close(); } catch (e) {}
  }
}

run();
