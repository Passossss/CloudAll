const express = require('express');
const axios = require('axios');
const router = express.Router();

// Azure SQL Function URL from environment
const AZURESQL_FUNCTION_URL = process.env.AZURESQL_FUNCTION_URL || 'http://localhost:7072/api/azuresql-function';
const FUNCTION_KEY = process.env.AZURE_FUNCTION_KEY || '';

/**
 * Proxy middleware for Azure SQL Function
 * Handles all HTTP methods (GET, POST, PUT, DELETE)
 */
const proxyToAzureSQLFunction = async (req, res) => {
  try {
    const config = {
      method: req.method,
      url: AZURESQL_FUNCTION_URL,
      data: req.body,
      params: req.query,
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': FUNCTION_KEY
      }
    };

    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error('Azure SQL Function Error:', error.message);
      res.status(503).json({ 
        error: 'Azure SQL Function unavailable',
        message: 'Azure Function (SQL) temporariamente indisponível',
        timestamp: new Date().toISOString()
      });
    }
  }
};

/**
 * POST /api/azuresql
 * Create record(s) in Azure SQL via Azure Function
 */
router.post('/', proxyToAzureSQLFunction);

/**
 * GET /api/azuresql
 * Read record(s) from Azure SQL via Azure Function
 * Query params: table, id, where, limit, offset
 */
router.get('/', proxyToAzureSQLFunction);

/**
 * PUT /api/azuresql
 * Update record in Azure SQL via Azure Function
 * Query params: table, id
 * Body: { data: {...} }
 */
router.put('/', proxyToAzureSQLFunction);

/**
 * DELETE /api/azuresql
 * Delete record from Azure SQL via Azure Function
 * Query params: table, id
 */
router.delete('/', proxyToAzureSQLFunction);

/**
 * POST /api/azuresql/event
 * Create via event (async pattern)
 * This endpoint triggers the Azure Function for CREATE events
 */
router.post('/event', async (req, res) => {
  try {
    const { table, data } = req.body;

    if (!table || !data) {
      return res.status(400).json({
        error: 'Table and data are required',
        timestamp: new Date().toISOString()
      });
    }

    // Send event to Azure Function (fire and forget or wait for response)
    const response = await axios.post(AZURESQL_FUNCTION_URL, {
      table,
      data
    }, {
      params: { table },
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': FUNCTION_KEY
      }
    });

    res.status(202).json({
      success: true,
      message: 'Event sent to Azure SQL Function',
      recordId: response.data.data?.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Azure SQL Event Error:', error.message);
    res.status(500).json({
      error: 'Failed to send event',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
