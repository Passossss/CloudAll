// MongoDB initialization script
db = db.getSiblingDB('fin_transactions');

// Create collections
db.createCollection('transactions');
db.createCollection('categories');

// Create indexes
db.transactions.createIndex({ userId: 1 });
db.transactions.createIndex({ date: -1 });
db.transactions.createIndex({ category: 1 });
db.transactions.createIndex({ type: 1 });

// Insert default categories
db.categories.insertMany([
  { name: 'Alimentação', type: 'expense', color: '#ef4444', icon: '🍕' },
  { name: 'Transporte', type: 'expense', color: '#3b82f6', icon: '🚗' },
  { name: 'Salário', type: 'income', color: '#10b981', icon: '💰' },
  { name: 'Entretenimento', type: 'expense', color: '#8b5cf6', icon: '🎮' },
  { name: 'Saúde', type: 'expense', color: '#84cc16', icon: '🏥' },
  { name: 'Casa', type: 'expense', color: '#d946ef', icon: '🏠' },
  { name: 'Educação', type: 'expense', color: '#f59e0b', icon: '📚' },
  { name: 'Investimentos', type: 'income', color: '#06b6d4', icon: '📈' }
]);

print('MongoDB database initialized successfully!');
