require('reflect-metadata');
const { DataSource } = require('typeorm');
require('dotenv').config();

const UserEntity = require('../entities/User');
const UserProfileEntity = require('../entities/UserProfile');

const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,
  username: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'FinApp123!',
  database: process.env.DB_NAME || 'fin_users_db',
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  entities: [UserEntity, UserProfileEntity],
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    enableArithAbort: true
  },
  extra: {
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false'
  }
});

let isInitialized = false;

const initDatabase = async () => {
  try {
    if (!isInitialized) {
      await AppDataSource.initialize();
      isInitialized = true;
      console.log('TypeORM connected to Azure SQL Server');
      console.log('Database schema synchronized');
    }
    return AppDataSource;
  } catch (error) {
    console.error('TypeORM initialization failed:', error);
    throw error;
  }
};

const getDataSource = () => {
  if (!isInitialized) {
    throw new Error('DataSource not initialized');
  }
  return AppDataSource;
};

const getUserRepository = () => {
  return getDataSource().getRepository('User');
};

const getUserProfileRepository = () => {
  return getDataSource().getRepository('UserProfile');
};

module.exports = {
  initDatabase,
  getDataSource,
  getUserRepository,
  getUserProfileRepository
};
