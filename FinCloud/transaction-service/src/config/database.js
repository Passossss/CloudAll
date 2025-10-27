const mongoose = require('mongoose');

let useMockDatabase = false;
const mockTransactions = new Map();

const connectDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://finuser:FinApp123!@localhost:27017/fin_transactions?authSource=admin';
    
    try {
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      
      console.log('✅ MongoDB connected successfully');

      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });
      
      // Graceful shutdown
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        process.exit(0);
      });
      
    } catch (dbError) {
      console.log('⚠️  Could not connect to MongoDB, using mock database for development');
      useMockDatabase = true;
      setupMockDatabase();
    }
    
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
};

module.exports = {
  connectDatabase,
};
