// AI generation service that prefers local Ollama and falls back to Gemini when necessary.
const ollama = require('ollama');
const { GoogleGenAI } = require('@google/genai');

const DEFAULT_OLLAMA_MODEL = 'llama3.2:3b';
const DEFAULT_OLLAMA_BASE_URL = 'http://localhost:11434';
const GEMINI_MODEL = 'gemini-2.0-flash';
const OLLAMA_TIMEOUT_MS = 2000;

function getOllamaModel() {
  return process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;
}

function getOllamaBaseUrl() {
  return process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL;
}

async function checkOllamaAvailable() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const response = await fetch(`${getOllamaBaseUrl()}/api/tags`, {
      signal: controller.signal
    });
    return response.ok;
  } catch (error) {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

function sanitizePromptForExternalAi(prompt) {
  return String(prompt || '').replace(/([A-Za-z]:\\[^\s\n\r]+)|((?:\\|\/)[^\s\n\r]+(?:\\|\/)[^\s\n\r]*)/g, '[FILE]');
}

async function callAI(prompt) {
  try {
    const response = await ollama.chat({
      model: getOllamaModel(),
      messages: [{ role: 'user', content: prompt }],
      stream: false
    });
    return response.message?.content || '';
  } catch (ollamaError) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return '';
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: sanitizePromptForExternalAi(prompt)
      });
      return response.text || '';
    } catch (fallbackError) {
      return '';
    }
  }
}

function buildContextFallbackBrief(activities, decisions, relatedFiles, filePath) {
  const recentActivity = (activities || [])[0] || null;
  const recentDecision = (decisions || [])[0] || null;
  const activityLine = recentActivity
    ? `${recentActivity.type || 'activity'} on ${filePath}: ${recentActivity.content || 'No activity details were captured.'}`
    : `No recent recorded activity was found for ${filePath}.`;
  const decisionLine = recentDecision
    ? `A related decision to review is "${recentDecision.title}"${recentDecision.rationale || recentDecision.description ? `: ${recentDecision.rationale || recentDecision.description}` : ''}.`
    : 'No related decisions were found for this file yet.';
  const relatedLine = (relatedFiles || []).length > 0
    ? `Related files worth checking next include ${relatedFiles.slice(0, 3).join(', ')}.`
    : 'No related files were discovered from recent activity.';

  return `${activityLine} ${decisionLine} ${relatedLine} Next, continue from the latest file changes and verify any unfinished follow-ups.`;
}

async function generateContextBrief(activities, decisions, filePath, relatedFiles = []) {
  const activityText = (activities || []).map((activity) => `${activity.type}: ${activity.content} @ ${activity.created_at}`).join('\n');
  const decisionText = (decisions || []).map((decision) => `${decision.title}: ${decision.rationale || decision.description}`).join('\n');
  const prompt = `You are a developer assistant. Based on this recent activity, write a 3-sentence context brief telling the developer where they left off.

File: ${filePath}
Recent activity (newest first):
${activityText}
Related decisions:
${decisionText}
Related files:
${(relatedFiles || []).join('\n')}

Write: 1) What were they doing, 2) Where they stopped, 3) What might need attention next.
Be specific. Use file names and technical terms.
Do not make up information not in the activity list.`;
  const aiResult = await callAI(prompt);
  if (aiResult && aiResult.trim().length > 0) {
    return aiResult;
  }

  return buildContextFallbackBrief(activities, decisions, relatedFiles, filePath);
}

async function generateStandup(groupedActivity) {
  const prompt = `Generate a developer standup update from this activity. Format it as three sections:

Yesterday: [what was done]
Today: [what to continue, inferred from last activity]
Blockers: [any errors or stuck points found in activity]

Keep it concise — 3-5 bullet points total.
Use technical language. Be specific about file names and features. Do not pad with filler text.

Activity:
${JSON.stringify(groupedActivity, null, 2)}`;
  const aiResult = await callAI(prompt);
  
  if (aiResult && aiResult.trim().length > 0) {
    return aiResult;
  }

  // Static fallback if AI quota exhausted or offline
  const filesText = (groupedActivity.filesEdited || []).slice(0, 5).join(', ') || 'No specific files';
  const commits = (groupedActivity.commits || []).length;
  const sessions = (groupedActivity.focusSessions || []).length;

  return `**Yesterday**
- Edited ${groupedActivity.filesEdited?.length || 0} files (e.g. ${filesText})
- Completed ${commits} local commits
- Logged ${sessions} deep focus sessions

**Today**
- Continue working on ${groupedActivity.projectName || 'current workspace tasks'}

**Blockers**
- None reported directly in activity`;
}

async function generateFocusSummary(activities, taskName, durationMinutes) {
  const activityText = (activities || []).map((activity) => `- ${activity.type}: ${activity.content}`).join('\n');
  const prompt = `Summarize this focus session for a developer.

Task: ${taskName}
Duration: ${durationMinutes} minutes
Activity:
${activityText}

Write 2-3 sentences covering:
1. What was accomplished
2. Which files were the main focus
3. What is the suggested next step

Be specific and technical.`;
  return callAI(prompt);
}



module.exports = {
  generateContextBrief,
  generateStandup,
  generateFocusSummary,
  checkOllamaAvailable
};
