import * as SQLite from "expo-sqlite";

const DB_NAME = "chat-history.db";
const MAX_THREADS = 5;

let db: SQLite.SQLiteDatabase | null = null;

function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync(DB_NAME);
    db.execSync(`
      CREATE TABLE IF NOT EXISTS threads (
        id TEXT PRIMARY KEY,
        title TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
      );
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
        parent_id TEXT,
        format TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
      );
      CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);
    `);
    db.execSync("PRAGMA foreign_keys = ON;");
  }
  return db;
}

export type ThreadRow = {
  id: string;
  title: string | null;
  created_at: number;
  updated_at: number;
};

export type MessageRow = {
  id: string;
  thread_id: string;
  parent_id: string | null;
  format: string;
  content: string;
  created_at: number;
};

export function listThreads(): ThreadRow[] {
  const database = getDb();
  return database.getAllSync<ThreadRow>(
    "SELECT * FROM threads ORDER BY updated_at DESC LIMIT ?",
    MAX_THREADS,
  );
}

export function createThread(id: string): void {
  const database = getDb();
  // Enforce cap: delete oldest threads beyond the limit (keep MAX_THREADS - 1 to make room)
  const existing = database.getAllSync<{ id: string }>(
    "SELECT id FROM threads ORDER BY updated_at DESC",
  );
  if (existing.length >= MAX_THREADS) {
    const toDelete = existing.slice(MAX_THREADS - 1);
    for (const row of toDelete) {
      database.runSync("DELETE FROM threads WHERE id = ?", row.id);
    }
  }
  database.runSync("INSERT INTO threads (id) VALUES (?)", id);
}

export function deleteThread(id: string): void {
  const database = getDb();
  database.runSync("DELETE FROM threads WHERE id = ?", id);
}

export function renameThread(id: string, title: string): void {
  const database = getDb();
  database.runSync(
    "UPDATE threads SET title = ?, updated_at = ? WHERE id = ?",
    title,
    Date.now(),
    id,
  );
}

export function touchThread(id: string): void {
  const database = getDb();
  database.runSync(
    "UPDATE threads SET updated_at = ? WHERE id = ?",
    Date.now(),
    id,
  );
}

export function loadMessages(threadId: string): MessageRow[] {
  const database = getDb();
  return database.getAllSync<MessageRow>(
    "SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC",
    threadId,
  );
}

export function appendMessage(
  id: string,
  threadId: string,
  parentId: string | null,
  format: string,
  content: string,
): void {
  const database = getDb();
  database.runSync(
    "INSERT OR REPLACE INTO messages (id, thread_id, parent_id, format, content) VALUES (?, ?, ?, ?, ?)",
    id,
    threadId,
    parentId,
    format,
    content,
  );
  // Update thread timestamp
  touchThread(threadId);
}

export function getThreadMessageCount(threadId: string): number {
  const database = getDb();
  const result = database.getFirstSync<{ count: number }>(
    "SELECT COUNT(*) as count FROM messages WHERE thread_id = ?",
    threadId,
  );
  return result?.count ?? 0;
}
