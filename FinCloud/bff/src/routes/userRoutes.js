const express = require('express');
const axios = require('axios');
const router = express.Router();

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

// Middleware para proxy das requisições
const proxyToUserService = async (req, res, next) => {
  try {
    const config = {
      method: req.method,
      url: `${USER_SERVICE_URL}/api/users${req.path}`,
      data: req.body,
      params: req.query,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    };

    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error('User Service Error:', error);
      console.error('Failed URL:', `${USER_SERVICE_URL}/api/users${req.path}`);
      res.status(503).json({ 
        error: 'User service unavailable',
        message: 'Serviço de usuários temporariamente indisponível',
        details: error.message
      });
    }
  }
};

// Rotas de usuários - App (normal users) - ORDEM É CRÍTICA!
router.post('/register', proxyToUserService);
router.post('/login', proxyToUserService);
router.get('/profile/:id', proxyToUserService);
router.put('/profile/:id', proxyToUserService);
router.delete('/profile/:id', proxyToUserService);
router.get('/stats/:id', proxyToUserService);

// Rotas de usuários - Admin (todos os usuários) - ORDEM É CRÍTICA!
// IMPORTANTE: Colocar rotas genéricas por último para evitar conflitos
router.get('/', proxyToUserService); // Lista todos os usuários (admin)
router.post('/', proxyToUserService); // Cria novo usuário (admin)
router.get('/:id', proxyToUserService); // Busca usuário por ID (admin) - DEVE VIR DEPOIS DE /stats/:id
router.put('/:id', proxyToUserService); // Atualiza usuário (admin)
router.delete('/:id', proxyToUserService); // Remove usuário (admin)
router.put('/:id/status', proxyToUserService); // Altera status (admin)
router.post('/:id/reset-password', proxyToUserService); // Reseta senha (admin)

module.exports = router;