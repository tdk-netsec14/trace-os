(async () => {
  try {
    const { db, DB_PATH } = require('../db/database');
    const fs = require('fs');

    const counts = {};
    counts.activities = db.prepare('SELECT COUNT(*) as c FROM activities').get().c;
    counts.decisions = db.prepare('SELECT COUNT(*) as c FROM decisions').get().c;
    counts.focus_sessions = db.prepare('SELECT COUNT(*) as c FROM focus_sessions').get().c;
    counts.context_cache = db.prepare('SELECT COUNT(*) as c FROM context_cache').get().c;

    const lastActivity = db.prepare('SELECT id,type,file_path,content,created_at FROM activities ORDER BY created_at DESC LIMIT 1').get() || null;

    let dbSize = null;
    try { dbSize = fs.statSync(DB_PATH).size; } catch (e) { dbSize = null; }

    const serverUrl = process.env.SERVER_URL || 'http://localhost:3001';
    const healthUrl = `${serverUrl}/api/health`;
    const contextUrl = `${serverUrl}/api/context/%2FREADME.md`;

    async function measure(url, runs = 10) {
      const times = [];
      let lastStatus = null;
      for (let i = 0; i < runs; i++) {
        const start = Date.now();
        try {
          const res = await fetch(url, { cache: 'no-store' });
          const text = await res.text();
          const ms = Date.now() - start;
          times.push(ms);
          lastStatus = { ok: res.ok, status: res.status, bodySample: text.slice(0, 500) };
        } catch (e) {
          const ms = Date.now() - start;
          times.push(ms);
          lastStatus = { ok: false, error: String(e) };
        }
      }
      const sum = times.reduce((a,b)=>a+b,0);
      return { runs: runs, times, avg: sum / times.length, min: Math.min(...times), max: Math.max(...times), lastStatus };
    }

    const healthStats = await measure(healthUrl, 10);
    const contextStats = await measure(contextUrl, 10);

    const report = {
      timestamp: Date.now(),
      dbPath: DB_PATH,
      dbSizeBytes: dbSize,
      counts,
      lastActivity,
      endpoints: {
        health: healthStats,
        context_readme: contextStats
      }
    };

    console.log(JSON.stringify(report, null, 2));
  } catch (err) {
    console.error('stats error', err);
    process.exit(1);
  }
})();
