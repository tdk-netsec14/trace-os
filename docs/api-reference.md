# API Reference

## Base URL

All routes are mounted under `http://localhost:3001/api` in the current repository.

## Response Conventions

- JSON is used throughout.
- Success responses typically return `success: true` or a resource payload.
- Error responses use a short `error` message and a non-200 status code.
- The API is designed for local clients, not public internet consumers.

## Health

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check server, Ollama, and DB configuration state |

### Response Shape

```json
{
  "status": "ok",
  "ollama": true,
  "model": "llama3.2:3b",
  "dbPath": "./data/devproductivity.db"
}
```

## Activity

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/activity` | Record a local developer event |
| `GET` | `/activity` | List recent activities |

### POST `/activity`

Accepted activity types:

- `file_open`
- `file_save`
- `file_close`
- `terminal_command`
- `git_commit`
- `focus_start`
- `focus_end`
- `decision_logged`

Request body:

```json
{
  "type": "file_save",
  "filePath": "src/App.jsx",
  "project": "trace-os",
  "content": "Updated dashboard layout",
  "metadata": { "source": "vscode" }
}
```

### GET `/activity`

Query parameters:

| Parameter | Type | Notes |
| --- | --- | --- |
| `limit` | number | Defaults to 50, capped at 500 |
| `project` | string | Optional filter |
| `type` | string | Optional filter |

Response shape:

```json
{
  "activities": [
    {
      "id": 1,
      "type": "file_save",
      "filePath": "src/App.jsx",
      "project": "trace-os",
      "content": "Updated dashboard layout",
      "metadata": {},
      "createdAt": 1710000000000
    }
  ]
}
```

## Context

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/context/:encodedFilePath` | Generate or return cached file-level context |

### Notes

- The file path must be URL-encoded.
- The route returns cached results when still valid.
- The payload includes related decisions and related files.

### Response Shape

```json
{
  "context": "...",
  "lastActivity": { "id": 1 },
  "relatedFiles": ["src/pages/DashboardPage.jsx"],
  "relatedDecisions": [],
  "generatedAt": 1710000000000,
  "cached": false
}
```

## Search

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/search` | Run semantic search across activities and decisions |

### Request Body

```json
{
  "query": "focus session summary",
  "limit": 10
}
```

### Response Shape

```json
{
  "results": [
    {
      "type": "activity",
      "content": "Updated dashboard layout",
      "filePath": "src/App.jsx",
      "score": 0.91,
      "createdAt": 1710000000000
    }
  ]
}
```

## Decisions

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/decisions` | Store a new architectural decision |
| `GET` | `/decisions` | List or search decisions |
| `DELETE` | `/decisions/:id` | Remove a stored decision |

### POST `/decisions`

Request body:

```json
{
  "title": "Use local-first storage",
  "description": "Keep captured developer context in SQLite",
  "rationale": "Privacy and offline access",
  "filesAffected": ["server/db/database.js"],
  "tags": ["architecture", "privacy"]
}
```

### GET `/decisions`

Query parameters:

| Parameter | Type | Notes |
| --- | --- | --- |
| `limit` | number | Defaults to 20, capped at 100 |
| `search` | string | Semantic search across title and description |
| `tag` | string | Filter by tag |

## Focus

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/focus/start` | Begin a focus session |
| `POST` | `/focus/end` | Finish the active focus session |
| `GET` | `/focus` | List focus sessions |
| `GET` | `/focus/active` | Return the current active session |

### POST `/focus/start`

Request body:

```json
{
  "taskName": "Refactor dashboard shell"
}
```

### POST `/focus/end`

Ends the active session, collects activity since the start timestamp, and returns a generated summary.

## Standup

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/standup` | Generate a standup from recent activity |

### Request Body

```json
{
  "hoursBack": 24
}
```

### Response Shape

```json
{
  "standup": "...",
  "periodStart": 1710000000000,
  "periodEnd": 1710086400000,
  "activityCount": 42
}
```

## Admin

| Method | Path | Purpose |
| --- | --- | --- |
| `DELETE` | `/admin/clear` | Clear all stored data from SQLite |

## Error Handling

Common failure cases are intentionally handled with compact messages:

- invalid activity types
- missing task names for focus sessions
- duplicate active focus sessions
- missing decision titles or descriptions
- AI provider unavailability
- general internal errors

## Integration Notes

- The VS Code extension uses the same API base path as the dashboard and desktop app.
- The extension currently performs a local health check during activation.
- The admin route should be treated as development-only functionality.