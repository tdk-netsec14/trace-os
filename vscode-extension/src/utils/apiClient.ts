// Fetch wrapper for the local server used by the VS Code extension.
const DEFAULT_SERVER_URL = 'http://localhost:3001';
const REQUEST_TIMEOUT_MS = 10000;

export function getServerUrl() {
  return process.env.SERVER_URL || DEFAULT_SERVER_URL;
}

export async function request(path: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getServerUrl()}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { error: data.error || 'Request failed' };
    }

    return data;
  } catch (error) {
    return { error: 'Server not running' };
  } finally {
    clearTimeout(timeoutId);
  }
}
