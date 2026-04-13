// Focus route for managing active developer work sessions.
const express = require('express');
const { db } = require('../db/database');
const { generateFocusSummary } = require('../services/aiService');

const router = express.Router();

router.post('/start', async (request, response) => {
  try {
    const { taskName } = request.body || {};
    if (!taskName) {
      return response.status(400).json({ error: 'taskName is required' });
    }

    const active = db.prepare("SELECT * FROM focus_sessions WHERE status = 'active' LIMIT 1").get();
    if (active) {
      return response.status(400).json({ error: 'A focus session is already active' });
    }

    const createdAt = Date.now();
    const result = db.prepare("INSERT INTO focus_sessions (task_name, started_at, ended_at, summary, files_touched, status) VALUES (?, ?, NULL, '', ?, 'active')").run(taskName, createdAt, JSON.stringify([]));

    return response.json({
      success: true,
      session: {
        id: result.lastInsertRowid,
        taskName,
        startedAt: createdAt,
        status: 'active',
        summary: '',
        filesTouched: []
      }
    });
  } catch (error) {
    return response.status(500).json({ error: 'Failed to start focus session' });
  }
});

router.post('/end', async (request, response) => {
  try {
    const active = db.prepare("SELECT * FROM focus_sessions WHERE status = 'active' LIMIT 1").get();
    if (!active) {
      return response.status(400).json({ error: 'No active focus session' });
    }

    const activities = db.prepare('SELECT * FROM activities WHERE created_at >= ? ORDER BY created_at DESC').all(active.started_at);
    const filesTouched = [...new Set(activities.filter((activity) => activity.file_path).map((activity) => activity.file_path))];
    const durationMinutes = Math.max(1, Math.round((Date.now() - active.started_at) / 60000));
    const summary = await generateFocusSummary(
      activities.map((activity) => ({ type: activity.type, content: activity.content })),
      active.task_name,
      durationMinutes
    );
    const endedAt = Date.now();

    db.prepare("UPDATE focus_sessions SET ended_at = ?, summary = ?, files_touched = ?, status = 'completed' WHERE id = ?").run(endedAt, summary, JSON.stringify(filesTouched), active.id);

    return response.json({
      success: true,
      session: {
        id: active.id,
        taskName: active.task_name,
        startedAt: active.started_at,
        endedAt,
        summary,
        filesTouched,
        status: 'completed'
      }
    });
  } catch (error) {
    return response.status(500).json({ error: 'Failed to end focus session' });
  }
});

router.get('/', async (request, response) => {
  try {
    const sessions = db.prepare('SELECT * FROM focus_sessions ORDER BY started_at DESC').all().map((session) => ({
      id: session.id,
      taskName: session.task_name,
      startedAt: session.started_at,
      endedAt: session.ended_at,
      summary: session.summary,
      filesTouched: safeParseJson(session.files_touched, []),
      status: session.status
    }));
    return response.json({ sessions });
  } catch (error) {
    return response.status(500).json({ error: 'Failed to load focus sessions' });
  }
});

router.get('/active', async (request, response) => {
  try {
    const session = db.prepare("SELECT * FROM focus_sessions WHERE status = 'active' LIMIT 1").get();
    if (!session) {
      return response.json({ session: null });
    }

    return response.json({
      session: {
        id: session.id,
        taskName: session.task_name,
        startedAt: session.started_at,
        endedAt: session.ended_at,
        summary: session.summary,
        filesTouched: safeParseJson(session.files_touched, []),
        status: session.status
      }
    });
  } catch (error) {
    return response.status(500).json({ error: 'Failed to load active focus session' });
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
