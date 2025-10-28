const express = require('express');
const axios = require('axios');
const router = express.Router();

// MongoDB Function URL from environment
const MONGODB_FUNCTION_URL = process.env.MONGODB_FUNCTION_URL || 'http://localhost:7071/api/mongodb-function';
const FUNCTION_KEY = process.env.AZURE_FUNCTION_KEY || '';

/**
 * Proxy middleware for MongoDB Function
 * Handles all HTTP methods (GET, POST, PUT, DELETE)
 */
const proxyToMongoFunction = async (req, res) => {
  try {
    const config = {
      method: req.method,
      url: MONGODB_FUNCTION_URL,
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
      console.error('MongoDB Function Error:', error.message);
      res.status(503).json({ 
        error: 'MongoDB Function unavailable',
        message: 'Azure Function (MongoDB) temporariamente indisponível',
        timestamp: new Date().toISOString()
      });
    }
  }
};

/**
 * POST /api/mongodb
 * Create document(s) in MongoDB via Azure Function
 */
router.post('/', proxyToMongoFunction);

/**
 * GET /api/mongodb
 * Read document(s) from MongoDB via Azure Function
 * Query params: collection, id, filter, limit, skip
 */
router.get('/', proxyToMongoFunction);

/**
 * PUT /api/mongodb
 * Update document in MongoDB via Azure Function
 * Query params: collection, id
 * Body: { data: {...} }
 */
router.put('/', proxyToMongoFunction);

/**
 * DELETE /api/mongodb
 * Delete document from MongoDB via Azure Function
 * Query params: collection, id
 */
router.delete('/', proxyToMongoFunction);

/**
 * POST /api/mongodb/event
 * Create via event (async pattern)
 * This endpoint triggers the Azure Function for CREATE events
 */
router.post('/event', async (req, res) => {
  try {
    const { collection, data } = req.body;

    if (!collection || !data) {
      return res.status(400).json({
        error: 'Collection and data are required',
        timestamp: new Date().toISOString()
      });
    }

    // Send event to Azure Function (fire and forget or wait for response)
    const response = await axios.post(MONGODB_FUNCTION_URL, {
      collection,
      data
    }, {
      params: { collection },
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': FUNCTION_KEY
      }
    });

    res.status(202).json({
      success: true,
      message: 'Event sent to MongoDB Function',
      eventId: response.data.insertedId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('MongoDB Event Error:', error.message);
    res.status(500).json({
      error: 'Failed to send event',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
