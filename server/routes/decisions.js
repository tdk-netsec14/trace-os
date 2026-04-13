// Decision route for storing and retrieving architectural decisions locally.
const express = require('express');
const { db } = require('../db/database');
const { generateEmbedding } = require('../services/embeddingService');
const { searchItems } = require('../services/searchService');

const router = express.Router();

router.post('/', async (request, response) => {
  try {
    const { title, description, rationale, filesAffected, tags } = request.body || {};

    if (!title || !description) {
      return response.status(400).json({ error: 'Title and description are required' });
    }

    const embedding = await generateEmbedding(`${title}\n${description}`);
    const createdAt = Date.now();
    const insert = db.prepare('INSERT INTO decisions (title, description, rationale, files_affected, tags, embedding, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const result = insert.run(
      title,
      description,
      rationale || '',
      JSON.stringify(filesAffected || []),
      JSON.stringify(Array.isArray(tags) ? tags : String(tags || '').split(',').map((tag) => tag.trim()).filter(Boolean)),
      JSON.stringify(embedding),
      createdAt
    );

    return response.json({
      success: true,
      id: result.lastInsertRowid,
      decision: {
        id: result.lastInsertRowid,
        title,
        description,
        rationale: rationale || '',
        filesAffected: filesAffected || [],
        tags: Array.isArray(tags) ? tags : String(tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
        createdAt
      }
    });
  } catch (error) {
    return response.status(500).json({ error: 'Failed to save decision' });
  }
});

router.get('/', async (request, response) => {
  try {
    const limit = Math.min(Number(request.query.limit) || 20, 100);
    const search = request.query.search ? String(request.query.search) : '';
    const tag = request.query.tag ? String(request.query.tag) : '';

    const decisions = db.prepare('SELECT * FROM decisions ORDER BY created_at DESC').all().map((decision) => ({
      id: decision.id,
      title: decision.title,
      description: decision.description,
      rationale: decision.rationale,
      filesAffected: safeParseJson(decision.files_affected, []),
      tags: safeParseJson(decision.tags, []),
      embedding: decision.embedding,
      createdAt: decision.created_at
    }));

    let filtered = decisions;
    if (tag) {
      filtered = filtered.filter((decision) => decision.tags.includes(tag));
    }

    if (search) {
      const items = await searchItems(search, [], filtered, limit);
      return response.json({ decisions: items.map((item) => ({
        id: item.id,
        title: item.content,
        description: item.content,
        score: item.score,
        createdAt: item.createdAt
      })) });
    }

    return response.json({ decisions: filtered.slice(0, limit) });
  } catch (error) {
    return response.status(500).json({ error: 'Failed to load decisions' });
  }
});

router.delete('/:id', async (request, response) => {
  try {
    db.prepare('DELETE FROM decisions WHERE id = ?').run(request.params.id);
    return response.json({ success: true });
  } catch (error) {
    return response.status(500).json({ error: 'Failed to delete decision' });
  }
});

function safeParseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

module.exports = router;
