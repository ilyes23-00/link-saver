import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "links.db");

const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  url TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  status TEXT NOT NULL,
  error TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
)
`);

export default db;