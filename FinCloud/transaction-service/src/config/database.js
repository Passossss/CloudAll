require('reflect-metadata');
const { DataSource } = require('typeorm');
require('dotenv').config();

const TransactionEntity = require('../entities/Transaction');

const AppDataSource = new DataSource({
  type: 'mongodb',
  url: process.env.MONGODB_URI || 'mongodb://finuser:FinApp123!@localhost:27017/fin_transactions?authSource=admin',
  database: process.env.MONGODB_DATABASE || 'fin_transactions',
  // Make synchronization opt-in via TYPEORM_SYNC to avoid automatic schema changes
  // in non-dev environments. Set TYPEORM_SYNC='true' to enable.
  synchronize: process.env.TYPEORM_SYNC === 'true',
  logging: process.env.NODE_ENV === 'development',
  entities: [TransactionEntity],
  useUnifiedTopology: true,
  useNewUrlParser: true
});

let isInitialized = false;

const connectDatabase = async () => {
  try {
    if (!isInitialized) {
      await AppDataSource.initialize();
      isInitialized = true;
      console.log('TypeORM connected to MongoDB');
      console.log('Database schema synchronized');
    }
    return AppDataSource;
  } catch (error) {
    console.error('TypeORM initialization failed:', error);
  }

  };

const getDataSource = () => {
  if (!isInitialized) {
    throw new Error('DataSource not initialized');
  }
  return AppDataSource;
};

const getTransactionRepository = () => {
  return getDataSource().getMongoRepository('Transaction');
};

module.exports = {
  connectDatabase,
  getDataSource,
  getTransactionRepository
};
