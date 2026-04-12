// Search route for semantic and keyword search across local activity data.
const express = require('express');
const { db } = require('../db/database');
const { searchItems } = require('../services/searchService');

const router = express.Router();

router.post('/', async (request, response) => {
  try {
    const query = String(request.body?.query || '').trim();
    const limit = Math.min(Number(request.body?.limit) || 10, 50);

    if (!query) {
      return response.json({ results: [] });
    }

    const activities = db.prepare('SELECT * FROM activities').all();
    const decisions = db.prepare('SELECT * FROM decisions').all();
    const results = await searchItems(query, activities, decisions, limit);

    return response.json({ results });
  } catch (error) {
    return response.status(500).json({ error: 'Failed to search activity' });
  }
});

module.exports = router;
