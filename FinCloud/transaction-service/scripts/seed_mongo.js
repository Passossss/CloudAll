#!/usr/bin/env node
require('dotenv').config();
const { MongoClient } = require('mongodb');
const fetch = global.fetch || require('node-fetch');
const path = require('path');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://finuser:FinApp123!@localhost:27017/fin_transactions?authSource=admin';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001/api/users';

const defaultCategories = [
  { name: 'Alimentação', type: 'expense', color: '#ef4444', icon: '🍕' },
  { name: 'Transporte', type: 'expense', color: '#3b82f6', icon: '🚗' },
  { name: 'Salário', type: 'income', color: '#10b981', icon: '💰' },
  { name: 'Entretenimento', type: 'expense', color: '#8b5cf6', icon: '🎮' },
  { name: 'Saúde', type: 'expense', color: '#84cc16', icon: '🏥' },
  { name: 'Casa', type: 'expense', color: '#d946ef', icon: '🏠' },
  { name: 'Educação', type: 'expense', color: '#f59e0b', icon: '📚' },
  { name: 'Investimentos', type: 'income', color: '#06b6d4', icon: '📈' }
];

async function run() {
  console.log('Fetching users from user-service to link transactions...');
  let usersResp;
  try {
    usersResp = await fetch(USER_SERVICE_URL, { timeout: 5000 });
  } catch (err) {
    console.error('Could not reach user-service at', USER_SERVICE_URL, err.message || err);
    process.exit(1);
  }

  if (!usersResp.ok) {
    console.error('User-service returned', usersResp.status);
    process.exit(1);
  }

  const body = await usersResp.json();
  const users = (body && body.data && body.data.users) || body.users || [];
  if (!users || users.length === 0) {
    console.error('No users returned from user-service; ensure user-service is running and has users.');
    process.exit(1);
  }

  // Pick two distinct users (prefer admin and user emails if present)
  const admin = users.find(u => u.email === 'admin@finapp.com');
  const normal = users.find(u => u.email === 'user@finapp.com');
  const selected = [];
  if (admin) selected.push(admin);
  if (normal && (!admin || admin.id !== normal.id)) selected.push(normal);
  // if still less than 2, take first two distinct
  for (const u of users) {
    if (selected.length >= 2) break;
    if (!selected.find(s => s.id === u.id)) selected.push(u);
  }

  if (selected.length === 0) {
    console.error('Could not select any users for transaction seeding.');
    process.exit(1);
  }

  console.log('Selected users for seeding:', selected.map(u => u.email || u.id));

  const client = new MongoClient(MONGO_URL, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db('fin_transactions');

    // ensure categories
    const categoriesCount = await db.collection('categories').countDocuments();
    if (categoriesCount === 0) {
      console.log('Inserting default categories...');
      await db.collection('categories').insertMany(defaultCategories);
    } else {
      console.log('Categories already exist — skipping.');
    }

    // create indexes
    await db.collection('transactions').createIndex({ userId: 1 });
    await db.collection('transactions').createIndex({ date: -1 });
    await db.collection('transactions').createIndex({ category: 1 });
    await db.collection('transactions').createIndex({ type: 1 });

    const txCount = await db.collection('transactions').countDocuments();
    if (txCount === 0) {
      console.log('Inserting sample transactions...');
      const now = new Date();
      const sample = [
        {
          userId: selected[0].id,
          amount: -45.75,
          category: 'Alimentação',
          type: 'expense',
          date: now,
          description: 'Almoço'
        },
        {
          userId: selected[0].id,
          amount: 2500.0,
          category: 'Salário',
          type: 'income',
          date: now,
          description: 'Salário mensal'
        },
        {
          userId: selected[1] ? selected[1].id : selected[0].id,
          amount: -120.0,
          category: 'Transporte',
          type: 'expense',
          date: now,
          description: 'Uber'
        }
      ];
      await db.collection('transactions').insertMany(sample);
    } else {
      console.log('Transactions already present — skipping.');
    }

    console.log('MongoDB seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding MongoDB:', err);
    process.exit(1);
  } finally {
    try { await client.close(); } catch (e) {}
  }
}

run();
