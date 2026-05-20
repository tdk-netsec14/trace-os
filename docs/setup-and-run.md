# Setup and Run

## Prerequisites

- Node.js 18 or newer
- npm
- Ollama installed locally
- Optional Gemini API key for fallback generation
- VS Code for the extension workflow

## Recommended Local AI Models

- `llama3.2:3b` for chat generation
- `nomic-embed-text` for embeddings

## Environment Variables

### `server/.env`

```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
DB_PATH=./data/devproductivity.db
```

### `vscode-extension/.env`

```env
SERVER_URL=http://localhost:3001
```

## Root Commands

| Command | Purpose |
| --- | --- |
| `npm run server` | Start the local API |
| `npm run web` | Start the web dashboard |
| `npm run desktop` | Start the Electron shell |
| `npm run extension:build` | Build the VS Code extension |
| `npm run extension:watch` | Rebuild the extension on change |
| `npm run dev` | Run server and web dashboard together |
| `npm run dev:all` | Run server, web dashboard, and extension watch together |

## Server Startup

1. Install dependencies in `server/`.
2. Ensure Ollama is running on `http://localhost:11434`.
3. Start the server with `node index.js` or the root `npm run server` script.
4. Verify health at `GET /api/health`.

## Web Dashboard Startup

1. Install dependencies in `web-dashboard/`.
2. Start Vite with `npm start` or `npm run dev`.
3. Open the local URL shown by Vite.
4. Confirm the dashboard can reach the server at `http://localhost:3001/api`.

## Electron App Startup

1. Install dependencies in `desktop-app/`.
2. Start the Vite shell and Electron launcher as configured in the package scripts.
3. Confirm the app can call the same local API as the web dashboard.

## VS Code Extension Startup

1. Install dependencies in `vscode-extension/`.
2. Build the extension with `npm run build`.
3. Open the extension development host in VS Code.
4. Make sure the local server is running before testing the sidebar views.

## Verification Checklist

- Health endpoint returns `status: ok`.
- Ollama availability is detected when the local model server is running.
- Activity records are visible in the dashboard.
- Context briefs can be generated for a file path.
- Focus sessions can be started and completed.
- Standup generation returns structured output.
- Search returns both activities and decisions.

## Common Failure Modes

- If the server is offline, the extension shows a warning during activation.
- If Ollama is unavailable, the system falls back to keyword matching and static text generation where possible.
- If Gemini is not configured, generation falls back to local deterministic summaries.
- If the database is reset, previously cached context and historical activity will be lost.

## Demo Reset

For a clean demo state, use the admin clear endpoint or restart with an empty SQLite database file. This removes activities, decisions, focus sessions, and cached contexts.