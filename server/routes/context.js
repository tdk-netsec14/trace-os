// Context route for generating and caching file-level activity summaries.
const express = require('express');
const { db } = require('../db/database');
const { generateContextBrief } = require('../services/aiService');

const router = express.Router();
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;

router.get('/:encodedFilePath', async (request, response) => {
  try {
    const filePath = decodeURIComponent(request.params.encodedFilePath);
    const now = Date.now();

    const cacheRow = db.prepare('SELECT context, generated_at, expires_at FROM context_cache WHERE file_path = ?').get(filePath);
    if (cacheRow && cacheRow.expires_at > now) {
      return response.json({
        context: cacheRow.context,
        lastActivity: null,
        relatedFiles: [],
        relatedDecisions: [],
        generatedAt: cacheRow.generated_at,
        cached: true
      });
    }

    const activities = db.prepare('SELECT id, type, file_path, project, content, metadata, created_at FROM activities WHERE file_path = ? ORDER BY created_at DESC LIMIT 15').all(filePath);
    const relatedDecisions = db.prepare('SELECT id, title, description, rationale, files_affected, tags, created_at FROM decisions WHERE files_affected LIKE ? ORDER BY created_at DESC LIMIT 10').all(`%${filePath}%`);
    const relatedFiles = db.prepare('SELECT file_path, COUNT(*) AS count FROM activities WHERE project = (SELECT project FROM activities WHERE file_path = ? ORDER BY created_at DESC LIMIT 1) AND file_path IS NOT NULL GROUP BY file_path ORDER BY count DESC LIMIT 10').all(filePath).map((row) => row.file_path).filter(Boolean);

    const context = await generateContextBrief(
      activities.map((activity) => ({
        type: activity.type,
        content: activity.content,
        created_at: activity.created_at
      })),
      relatedDecisions.map((decision) => ({
        title: decision.title,
        rationale: decision.rationale,
        description: decision.description
      })),
      filePath,
      relatedFiles
    );

    const lastActivity = activities[0] || null;
    const generatedAt = now;
    const expiresAt = now + CACHE_TTL_MS;
    db.prepare('INSERT INTO context_cache (file_path, context, generated_at, expires_at) VALUES (?, ?, ?, ?) ON CONFLICT(file_path) DO UPDATE SET context = excluded.context, generated_at = excluded.generated_at, expires_at = excluded.expires_at').run(filePath, context, generatedAt, expiresAt);

    return response.json({
      context,
      lastActivity,
      relatedFiles,
      relatedDecisions: relatedDecisions.map((decision) => ({
        id: decision.id,
        title: decision.title,
        description: decision.description,
        rationale: decision.rationale,
        createdAt: decision.created_at
      })),
      generatedAt,
      cached: false
    });
  } catch (error) {
    return response.status(500).json({ error: 'Failed to load context' });
  }
});

module.exports = router;
