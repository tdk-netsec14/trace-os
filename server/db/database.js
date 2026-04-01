// SQLite database connection and initialization for the local server.
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const dotenv = require('dotenv');
const { initializeSchema } = require('./schema');

dotenv.config();

const DEFAULT_DB_PATH = './data/devproductivity.db';
const DB_PATH = process.env.DB_PATH || DEFAULT_DB_PATH;
const RESOLVED_DB_PATH = path.isAbsolute(DB_PATH) ? DB_PATH : path.resolve(__dirname, '..', DB_PATH);
const DB_DIR = path.dirname(RESOLVED_DB_PATH);

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(RESOLVED_DB_PATH);
db.pragma('journal_mode = WAL');
initializeSchema(db);

module.exports = {
  db,
  DB_PATH: RESOLVED_DB_PATH
};
