# Project Brief

## Executive Summary

Trace OS is a privacy-first developer context intelligence platform that converts low-level development activity into reusable project memory. It captures editor, terminal, and git events; stores them in a local SQLite database; and uses AI-assisted summarization and semantic search to rebuild context, generate standups, and surface architectural decisions.

The project is designed as a practical engineering system rather than a prototype UI. It includes a VS Code extension for capture, a Node.js backend for orchestration, a React dashboard for analysis, and an Electron desktop shell for a native workspace experience.

## Problem Statement

Modern development work produces a large amount of context that is easy to lose:

- Why a file was changed is often not written down.
- Standups are usually reconstructed manually from memory.
- Session context is fragmented across editor, terminal, and git.
- Search across past work is typically keyword-only and shallow.
- Cloud-heavy tooling can create privacy and compliance concerns.

Trace OS addresses that by keeping the capture and storage loop local while adding semantic retrieval and AI-generated summaries on top.

## Main Goal

The main goal is to create a developer memory layer that makes recent work discoverable, explainable, and reusable without requiring the user to manually document every action.

## Target Users

| User Group | Why They Use It |
| --- | --- |
| Individual developers | Recover context quickly and reduce manual note-taking |
| Team leads | Generate concise standups and review progress signals |
| Architects | Track decisions and reasoning over time |
| Product/demo teams | Present a polished story of engineering productivity |
| Privacy-sensitive organizations | Keep activity data local-first |

## Core Features

| Feature | Description |
| --- | --- |
| Activity capture | Records file, terminal, git, focus, and decision events |
| Semantic search | Searches both activities and decisions using embeddings |
| Context briefs | Generates file-specific summaries with caching |
| Focus sessions | Starts, ends, and summarizes deep-work sessions |
| Standup generation | Produces standup-ready summaries from recent history |
| Decision logging | Stores architecture decisions with rationale and tags |
| Dashboard analytics | Provides a command-center view of recent development signals |
| Local health checks | Verifies server, database, and Ollama availability |

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, React Router, Vite, Tailwind CSS, D3, Recharts |
| Backend | Node.js, Express |
| Database | SQLite with `better-sqlite3` |
| AI/ML | Ollama embeddings and chat, Gemini fallback via `@google/genai` |
| Cloud | Optional Gemini API for fallback generation; otherwise local-only |
| Authentication | Not implemented in the current repository |
| DevOps | npm scripts, Vite builds, Electron Builder for packaging |
| APIs | REST JSON API under `/api` |
| Other tools | Axios, CORS, `express-rate-limit`, TypeScript in the VS Code extension |

## AI Models and Services

| Capability | Model / Service |
| --- | --- |
| Text generation | Ollama chat, default model `llama3.2:3b` |
| Fallback generation | Gemini `gemini-2.0-flash` |
| Embeddings | Ollama `nomic-embed-text` |
| Semantic similarity | Cosine similarity over stored embeddings |

## Major Dependencies

| Area | Dependencies |
| --- | --- |
| Server | `express`, `better-sqlite3`, `cors`, `dotenv`, `express-rate-limit`, `ollama`, `@google/genai` |
| Dashboard / Electron | `react`, `react-dom`, `react-router-dom`, `axios`, `d3`, `recharts` |
| Electron packaging | `electron`, `electron-builder` |
| VS Code extension | `typescript`, `esbuild`, `@types/vscode`, `@types/node`, `@types/react`, `@types/react-dom`, `react`, `react-dom` |

## Deployment Platform

Trace OS is currently designed as a local-first system. The server runs on the developer machine, the extension connects to `localhost`, and the dashboard and desktop app both consume the same local API. The Electron app can be packaged for desktop distribution, but the repository does not depend on a cloud-hosted backend.

## Architecture Type

Trace OS is best described as a hybrid local-first monolith with multiple client surfaces. The backend and data store are centralized locally, while the UI is split across the extension, browser dashboard, and Electron app.

## Product Differentiators

- The system captures context automatically instead of relying on manual note-taking.
- Semantic search is applied to both activity and decisions, not just file names.
- AI summaries are grounded in local activity records, which makes them more explainable.
- The default operating mode keeps sensitive developer context on-device.
- The same backend serves three different experience surfaces.

## One-Line Pitch

Trace OS is a local-first developer memory system that turns raw coding activity into searchable context, AI summaries, and decision history across VS Code, web, and desktop surfaces.