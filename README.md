<div align="center">
  <img src="landing-page/public/favicon.svg" alt="Trace OS Logo" width="120" />
  <h1>Trace OS</h1>
  <p><b>Privacy-first, local-first developer context intelligence system.</b></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
  [![Electron](https://img.shields.io/badge/Electron-30+-47848F.svg?logo=electron&logoColor=white)](https://www.electronjs.org/)
  [![Ollama](https://img.shields.io/badge/AI-Ollama-000000.svg?logo=ollama&logoColor=white)](https://ollama.com/)
</div>

<br/>

Trace OS captures activity from inside your editor, stores it in a local SQLite database, and turns that data into searchable context, focus-session summaries, architectural decisions, and standup-ready updates.

It operates as a **multi-surface product**:
1. **VS Code Extension** for passive capture and quick workflow actions.
2. **Express API** backend with local AI and semantic-search services.
3. **React Web Dashboard** for deep analysis and visualization.
4. **Electron Desktop App** for a native workspace view.

---

## 📸 Screenshots

> *Add application screenshots here*
>
> | VS Code Sidebar | Web Dashboard | Knowledge Graph |
> | :---: | :---: | :---: |
> | ![VS Code Extension Placeholder](https://via.placeholder.com/300x200.png?text=VS+Code+Sidebar) | ![Web Dashboard Placeholder](https://via.placeholder.com/300x200.png?text=Web+Dashboard) | ![Knowledge Graph Placeholder](https://via.placeholder.com/300x200.png?text=Knowledge+Graph) |

---

## 🏗️ Architecture Overview

Trace OS uses a **hybrid local-first monolith** architecture. It relies on a centralized Express server backed by SQLite (using WAL mode for concurrent access) running locally on your machine. All surfaces (VS Code, Web, Electron) communicate with this single local API.

### Multi-Client Ecosystem
- **VS Code Extension**: Written in TypeScript, it passively captures file changes, terminal commands, and git commits. It embeds webviews to display AI summaries and context directly in the editor sidebar.
- **Electron Desktop App & React Dashboard**: Built with Vite and Tailwind CSS. They provide command-palette UX, activity feeds, D3-powered knowledge graphs, and standup generation modals.

---

## 🧠 AI Pipeline & Semantic Search

Trace OS uses a dual-layer AI strategy to maintain strict privacy:

1. **Primary (Local-First)**: Powered by local [Ollama](https://ollama.com/). Uses `llama3.2:3b` for summarization/chat and `nomic-embed-text` for generating vector embeddings. 
2. **Fallback**: If Ollama is unavailable, the system safely falls back to the Google Gemini API (stripping sensitive file paths before transit).

### Semantic Search
Every tracked activity and logged architectural decision is vectorized into an embedding array. When you search your workspace, Trace OS computes **cosine similarity** across these embeddings, retrieving results based on *meaning* rather than exact keyword matches.

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Local Ollama installation (with `llama3.2:3b` and `nomic-embed-text` models pulled)
- VS Code (for the extension)

### 1. Configure Environment
Copy `.env.example` to the required locations:
```bash
cp .env.example server/.env
cp .env.example vscode-extension/.env
```
*(Optional: Add your `GEMINI_API_KEY` to `server/.env` if you want cloud fallback)*

### 2. Start the Local Server & Dashboard
From the root directory, you can start the backend and web dashboard concurrently:
```bash
npm install -g concurrently
npm install
npm run dev
```

### 3. Launch Desktop App (Electron)
```bash
npm run desktop
```

### 4. Build the VS Code Extension
```bash
npm run extension:build
# Or use 'npm run extension:watch' for live reloading
```

---

## 🔌 API Overview

The Express backend (`http://localhost:3001/api`) provides the following key endpoints:

- `GET /health`: System status and Ollama availability check.
- `POST /activity`: Ingest file edits, terminal commands, and git commits.
- `GET /context/:filePath`: Generates and caches an AI context brief for a specific file.
- `POST /search`: Performs cosine-similarity semantic search across all vectorized data.
- `POST /focus/start` & `POST /focus/end`: Manage deep-work blocks and generate AI summaries of touched files.
- `POST /decisions`: Log and vector-embed architectural decisions.
- `POST /standup`: Generates an AI standup report (Yesterday/Today/Blockers) based on recent activity.

*(See `docs/api-reference.md` for full payload schemas.)*

---

## 🔒 Security

- **Local By Default**: Your codebase and activity data never leave your machine unless you explicitly configure the Gemini API fallback.
- **Data Sanitization**: The VS Code terminal listener actively sanitizes common secrets (tokens, passwords) from recorded shell commands.
- **File Exclusions**: Activities within `.git/`, `node_modules/`, and binary files are automatically ignored.

---

## 📦 Deployment

Trace OS is designed to be run as a local productivity tool rather than a hosted SaaS. 
To package the Electron desktop application for your OS:
```bash
cd desktop-app
npm install
npm run electron-build
```

---

## 🤝 Contribution Guidelines

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Ensure no `.env` files or the `server/data/` database folder are accidentally committed.
4. Commit your changes (`git commit -m 'Add amazing feature'`).
5. Push to the branch (`git push origin feature/amazing-feature`).
6. Open a Pull Request.

---
<div align="center">
  <p>Built for engineers who want to code more and report less.</p>
</div>
