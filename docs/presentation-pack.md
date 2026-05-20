# Presentation Pack

## 30-Second Pitch

Trace OS is a privacy-first developer memory system that captures local coding activity, stores it in SQLite, and uses semantic search plus AI summaries to recover context, generate standups, and track architectural decisions across VS Code, a web dashboard, and an Electron desktop app.

## 2-Minute Explanation

Trace OS solves a common engineering problem: important context disappears between editor sessions, terminal commands, git commits, and ad hoc notes. Instead of asking developers to manually document everything, it captures meaningful activity signals automatically.

The local Express backend stores that activity in SQLite, enriches it with embeddings, and uses Ollama first with Gemini as a fallback for summarization. The result is a system that can answer questions like what happened in a file, what should go into a standup, which files were involved in a focus session, and which decisions explain the current implementation.

The architecture is intentionally local-first. That makes the system useful for privacy-sensitive workflows and also makes it credible as a real engineering product, because the data model, API surface, and client surfaces are all coherent and reusable.

## Demo Flow

Use this flow for a live presentation.

1. Open the VS Code extension sidebar and show the five views: Context, Standup, Search, Focus, and Decisions.
2. Trigger a file or terminal activity and explain how it lands in the local server and SQLite store.
3. Open the dashboard and show the activity feed plus focus-session card.
4. Start a focus session, then end it to show the AI-generated summary.
5. Run semantic search for a project concept and show ranked activity/decision results.
6. Open a file context brief and explain the cache-based resume workflow.
7. Generate a standup and show how the output is formatted for reporting.
8. Log a decision and show that it becomes searchable later.

## Investor / Demo Narrative

### The User Pain

Engineering teams lose time reconstructing context after breaks, meetings, or task switches.

### The Product Answer

Trace OS creates a structured memory layer for development work without moving that memory to a cloud backend by default.

### Why It Matters

- Less manual status reporting
- Faster context recovery
- Better decision traceability
- Cleaner handoff between work sessions
- Strong privacy posture for local-first teams

## Resume Bullets

- Built a local-first AI developer productivity platform combining a VS Code extension, Express API, SQLite persistence, and React/Electron clients.
- Implemented semantic search and AI summarization pipelines using embeddings, cosine similarity, and fallback generation strategies.
- Designed a multi-surface architecture that captures file, terminal, git, focus, and decision signals into a shared local context model.
- Delivered a dashboard and command-palette workflow for standups, session tracking, and context recovery.

## Viva / Interview Talking Points

### 1. What is the architecture type?

It is a hybrid local-first monolith with multiple clients. The backend and database are centralized locally, while the UX is split across VS Code, web, and desktop surfaces.

### 2. Why use SQLite instead of a remote database?

SQLite keeps the system simple, fast, portable, and privacy-friendly for a developer-local workload. The data model is small and event-driven, which fits SQLite well.

### 3. Why use embeddings?

Embeddings let Trace OS search by meaning instead of just exact words. That is important when users search for concepts, work items, or decisions that were described differently in the past.

### 4. Why is Ollama first and Gemini second?

The default path is local generation for privacy and offline resilience. Gemini is a fallback for situations where the local model is unavailable.

### 5. What makes this more than a dashboard?

The system captures, stores, summarizes, and retrieves developer context. It is not only visualizing data; it is producing a reusable memory layer.

## Technical Strengths To Emphasize

- Multiple clients share one local API.
- The schema is small but expressive.
- AI features have fallback logic instead of hard failure.
- Search spans both operational activity and architectural decisions.
- Context briefs are cached to reduce repeated work.

## Suggested Closing Line

Trace OS turns scattered development signals into structured memory, which makes engineering work easier to explain, resume, and review.