const express = require('express');
const axios = require('axios');
const router = express.Router();

// Function URLs from environment
const MONGODB_FUNCTION_URL = process.env.MONGODB_FUNCTION_URL || 'http://localhost:7071/api/mongodb-function';
const AZURESQL_FUNCTION_URL = process.env.AZURESQL_FUNCTION_URL || 'http://localhost:7072/api/azuresql-function';
const FUNCTION_KEY = process.env.AZURE_FUNCTION_KEY || '';

/**
 * GET /api/aggregation/data
 * Aggregates data from both MongoDB Function and Azure SQL Function
 * along with microservices in a single response
 */
router.get('/data', async (req, res) => {
  try {
    const { mongoCollection, sqlTable, userId } = req.query;

    // Parallel requests to both functions and microservices
    const requests = [];
    const sources = {};

    // MongoDB Function request
    if (mongoCollection) {
      requests.push(
        axios.get(MONGODB_FUNCTION_URL, {
          params: { 
            collection: mongoCollection,
            filter: userId ? JSON.stringify({ userId }) : undefined
          },
          headers: {
            'x-functions-key': FUNCTION_KEY
          }
        }).then(response => {
          sources.mongodb = response.data;
        }).catch(error => {
          console.error('MongoDB Function error:', error.message);
          sources.mongodb = { error: error.message, available: false };
        })
      );
    }

    // Azure SQL Function request
    if (sqlTable) {
      requests.push(
        axios.get(AZURESQL_FUNCTION_URL, {
          params: { 
            table: sqlTable,
            where: userId ? `userId = ${userId}` : undefined
          },
          headers: {
            'x-functions-key': FUNCTION_KEY
          }
        }).then(response => {
          sources.azuresql = response.data;
        }).catch(error => {
          console.error('Azure SQL Function error:', error.message);
          sources.azuresql = { error: error.message, available: false };
        })
      );
    }

    // User Service request (microservice)
    if (userId) {
      const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
      requests.push(
        axios.get(`${userServiceUrl}/api/users/profile/${userId}`)
          .then(response => {
            sources.userService = response.data;
          }).catch(error => {
            console.error('User Service error:', error.message);
            sources.userService = { error: error.message, available: false };
          })
      );
    }

    // Transaction Service request (microservice)
    if (userId) {
      const transactionServiceUrl = process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3002';
      requests.push(
        axios.get(`${transactionServiceUrl}/api/transactions/user/${userId}/summary`)
          .then(response => {
            sources.transactionService = response.data;
          }).catch(error => {
            console.error('Transaction Service error:', error.message);
            sources.transactionService = { error: error.message, available: false };
          })
      );
    }

    // Wait for all requests to complete
    await Promise.all(requests);

    // Aggregate response
    const aggregatedData = {
      success: true,
      timestamp: new Date().toISOString(),
      sources: sources,
      summary: {
        totalSources: Object.keys(sources).length,
        availableSources: Object.values(sources).filter(s => !s.error).length,
        errors: Object.entries(sources)
          .filter(([_, value]) => value.error)
          .map(([key, value]) => ({ source: key, error: value.error }))
      }
    };

    res.status(200).json(aggregatedData);
  } catch (error) {
    console.error('Aggregation error:', error);
    res.status(500).json({
      error: 'Aggregation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/aggregation/user/:userId
 * Aggregates all user-related data from all sources
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [mongoData, sqlData, userProfile, transactions] = await Promise.allSettled([
      // MongoDB - user preferences or logs
      axios.get(MONGODB_FUNCTION_URL, {
        params: { 
          collection: 'user_preferences',
          filter: JSON.stringify({ userId })
        },
        headers: { 'x-functions-key': FUNCTION_KEY }
      }),
      
      // Azure SQL - user audit logs
      axios.get(AZURESQL_FUNCTION_URL, {
        params: { 
          table: 'user_audit_logs',
          where: `userId = '${userId}'`
        },
        headers: { 'x-functions-key': FUNCTION_KEY }
      }),

      // User Service
      axios.get(`${process.env.USER_SERVICE_URL || 'http://localhost:3001'}/api/users/profile/${userId}`),

      // Transaction Service
      axios.get(`${process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3002'}/api/transactions/user/${userId}/summary`)
    ]);

    res.status(200).json({
      success: true,
      userId: userId,
      data: {
        preferences: mongoData.status === 'fulfilled' ? mongoData.value.data : null,
        auditLogs: sqlData.status === 'fulfilled' ? sqlData.value.data : null,
        profile: userProfile.status === 'fulfilled' ? userProfile.value.data : null,
        transactions: transactions.status === 'fulfilled' ? transactions.value.data : null
      },
      errors: [
        mongoData.status === 'rejected' ? { source: 'mongodb', error: mongoData.reason.message } : null,
        sqlData.status === 'rejected' ? { source: 'azuresql', error: sqlData.reason.message } : null,
        userProfile.status === 'rejected' ? { source: 'userService', error: userProfile.reason.message } : null,
        transactions.status === 'rejected' ? { source: 'transactionService', error: transactions.reason.message } : null
      ].filter(e => e !== null),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('User aggregation error:', error);
    res.status(500).json({
      error: 'User aggregation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
