(async () => {
  try {
    const { db } = require('../db/database');
    const { GoogleGenAI } = require('@google/genai');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY missing');
      process.exit(1);
    }

    const filePath = '/README.md';

    const activities = db.prepare('SELECT id,type,file_path,project,content,metadata,created_at FROM activities WHERE file_path = ? ORDER BY created_at DESC LIMIT 15').all(filePath);
    const relatedDecisions = db.prepare('SELECT id,title,description,rationale,files_affected,tags,created_at FROM decisions WHERE files_affected LIKE ? ORDER BY created_at DESC LIMIT 10').all(`%${filePath}%`);

    const activityText = (activities || []).map(a => `${a.type}: ${a.content} @ ${new Date(a.created_at).toISOString()}`).join('\n');
    const decisionText = (relatedDecisions || []).map(d => `${d.title}: ${d.rationale || d.description}`).join('\n');

    const prompt = `You are a developer assistant. Based on this recent activity, write a 3-sentence context brief telling the developer where they left off.\n\nFile: ${filePath}\nRecent activity (newest first):\n${activityText}\nRelated decisions:\n${decisionText}\n\nWrite: 1) What were they doing, 2) Where they stopped, 3) What might need attention next. Be specific.`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
    const text = response?.text || '';

    const now = Date.now();
    const expires = now + 4 * 60 * 60 * 1000;

    db.prepare('INSERT INTO context_cache (file_path, context, generated_at, expires_at) VALUES (?,?,?,?) ON CONFLICT(file_path) DO UPDATE SET context = excluded.context, generated_at = excluded.generated_at, expires_at = excluded.expires_at').run(filePath, text, now, expires);

    console.log('generated length', text.length);
    console.log(text);
  } catch (err) {
    console.error('error', err);
    process.exit(1);
  }
})();
