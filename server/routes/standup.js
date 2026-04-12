// Standup route that summarizes recent developer activity.
const express = require('express');
const { db } = require('../db/database');
const { generateStandup } = require('../services/aiService');

const router = express.Router();

router.post('/', async (request, response) => {
  try {
    const hoursBack = Number(request.body?.hoursBack) || 24;
    const periodEnd = Date.now();
    const periodStart = periodEnd - hoursBack * 60 * 60 * 1000;

    const activities = db.prepare('SELECT * FROM activities WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC').all(periodStart, periodEnd);
    const filesEdited = [...new Set(activities.filter((activity) => activity.file_path).map((activity) => activity.file_path))];
    const commits = activities.filter((activity) => activity.type === 'git_commit');
    const focusSessions = db.prepare('SELECT * FROM focus_sessions WHERE started_at BETWEEN ? AND ? OR ended_at BETWEEN ? AND ? ORDER BY started_at DESC').all(periodStart, periodEnd, periodStart, periodEnd);
    const groupedActivity = {
      filesEdited,
      commits: commits.map((commit) => commit.content),
      focusSessions: focusSessions.map((session) => ({ taskName: session.task_name, summary: session.summary })),
      projectName: activities[0]?.project || null,
      periodHours: hoursBack
    };

    const standup = await generateStandup(groupedActivity);
    return response.json({
      standup,
      periodStart,
      periodEnd,
      activityCount: activities.length
    });
  } catch (error) {
    return response.status(500).json({ error: 'Failed to generate standup' });
  }
});

module.exports = router;
