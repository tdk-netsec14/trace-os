// API client for the local Trace OS server.
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 15000,
});

// ── Activity ──
export const getActivities = (limit = 50) =>
  api.get(`/activity?limit=${limit}`).then((r) => r.data.activities || []);

// ── Focus Sessions ──
export const getActiveSession = () =>
  api.get('/focus/active').then((r) => r.data.session || null);

export const startFocusSession = (taskName) =>
  api.post('/focus/start', { taskName }).then((r) => r.data.session);

export const endFocusSession = () =>
  api.post('/focus/end').then((r) => r.data.session);

export const getFocusSessions = () =>
  api.get('/focus').then((r) => r.data.sessions || []);

// ── Standup ──
export const generateStandup = (hoursBack = 24) =>
  api.post('/standup', { hoursBack }).then((r) => r.data);

// ── Context ──
export const getContext = (filePath) =>
  api.get(`/context/${encodeURIComponent(filePath)}`).then((r) => r.data);

// ── Search ──
export const search = (query, limit = 10) =>
  api.post('/search', { query, limit }).then((r) => r.data.results || []);

// ── Decisions ──
export const getDecisions = (limit = 50) =>
  api.get(`/decisions?limit=${limit}`).then((r) => r.data.decisions || []);

export const createDecision = (data) =>
  api.post('/decisions', data).then((r) => r.data);

export const deleteDecision = (id) =>
  api.delete(`/decisions/${id}`).then((r) => r.data);

// ── Health ──
export const getHealth = () =>
  api.get('/health').then((r) => r.data);

// ── Admin ──
export const clearAllData = () =>
  api.delete('/admin/clear').then((r) => r.data);

export default api;
