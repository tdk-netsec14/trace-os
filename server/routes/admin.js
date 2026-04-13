// Local admin route for clearing all stored data in the SQLite database.
const express = require('express');
const { db } = require('../db/database');

const router = express.Router();

router.delete('/clear', async (request, response) => {
  try {
    db.exec('DELETE FROM activities; DELETE FROM decisions; DELETE FROM focus_sessions; DELETE FROM context_cache; DELETE FROM sqlite_sequence WHERE name IN (\'activities\', \'decisions\', \'focus_sessions\', \'context_cache\');');
    return response.json({ success: true });
  } catch (error) {
    return response.status(500).json({ error: 'Failed to clear data' });
  }
});

module.exports = router;
