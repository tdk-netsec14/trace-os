// Activity route for recording and listing local developer events.
const express = require('express');
const { db } = require('../db/database');
const { generateEmbedding } = require('../services/embeddingService');

const router = express.Router();
const ALLOWED_TYPES = new Set([
  'file_open',
  'file_save',
  'file_close',
  'terminal_command',
  'git_commit',
  'focus_start',
  'focus_end',
  'decision_logged'
]);

router.post('/', async (request, response) => {
  try {
    const { type, filePath, project, content, metadata } = request.body || {};

    if (!ALLOWED_TYPES.has(type)) {
      return response.status(400).json({ error: 'Invalid activity type' });
    }

    const embedding = await generateEmbedding(String(content || ''));
    const createdAt = Date.now();
    const insert = db.prepare(
      'INSERT INTO activities (type, file_path, project, content, metadata, embedding, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const result = insert.run(
      type,
      filePath || null,
      project || null,
      content || '',
      JSON.stringify(metadata || {}),
      JSON.stringify(embedding),
      createdAt
    );

    return response.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    return response.status(500).json({ error: 'Failed to save activity' });
  }
});

router.get('/', async (request, response) => {
  try {
    const limit = Math.min(Number(request.query.limit) || 50, 500);
    const params = [];
    const clauses = [];

    if (request.query.project) {
      clauses.push('project = ?');
      params.push(request.query.project);
    }

    if (request.query.type) {
      clauses.push('type = ?');
      params.push(request.query.type);
    }

    const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const statement = db.prepare(`SELECT id, type, file_path, project, content, metadata, created_at FROM activities ${whereClause} ORDER BY created_at DESC LIMIT ?`);
    const rows = statement.all(...params, limit).map((row) => {
      let metadata = {};
      try {
        metadata = row.metadata ? JSON.parse(row.metadata) : {};
      } catch (parseError) {
        metadata = {};
      }
      return {
        id: row.id,
        type: row.type,
        filePath: row.file_path,
        project: row.project,
        content: row.content,
        metadata,
        createdAt: row.created_at
      };
    });

    return response.json({ activities: rows });
  } catch (error) {
    console.error('Activity route error:', error);
    return response.status(500).json({ error: 'Failed to load activities' });
  }
});

module.exports = router;
