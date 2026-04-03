// Health route for checking the server, database, and Ollama status.
const express = require('express');
const { checkOllamaAvailable } = require('../services/aiService');
const { DB_PATH } = require('../db/database');

const router = express.Router();

router.get('/', async (request, response) => {
  try {
    const ollama = await checkOllamaAvailable();
    response.json({
      status: 'ok',
      ollama,
      model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
      dbPath: DB_PATH
    });
  } catch (error) {
    response.status(500).json({ error: 'Failed to check health' });
  }
});

module.exports = router;
