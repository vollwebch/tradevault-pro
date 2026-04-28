import Database from 'better-sqlite3'
import path from 'path'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const DB_PATH = path.join('/home/z/my-project/db', 'tradevault.db')

const globalForDb = globalThis as unknown as {
  _tradevaultDb: Database.Database | undefined
}

const db = globalForDb._tradevaultDb ?? new Database(DB_PATH)

if (process.env.NODE_ENV !== 'production') globalForDb._tradevaultDb = db

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT,
    avatar TEXT,
    broker TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS trades (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    symbol TEXT NOT NULL,
    direction TEXT NOT NULL,
    entry_price REAL NOT NULL,
    exit_price REAL NOT NULL,
    stop_loss REAL,
    take_profit REAL,
    shares INTEGER NOT NULL,
    setup TEXT,
    notes TEXT,
    emotion INTEGER,
    screenshot TEXT,
    tags TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
  CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(date);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`)

// ─── Helper functions ───

const JWT_SECRET = process.env.JWT_SECRET || 'tradevault-pro-secret-key-2025-change-in-production'

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export function getUserById(id: string) {
  return db.prepare('SELECT id, email, name, avatar, broker, created_at as createdAt FROM users WHERE id = ?').get(id) as (Omit<{ id: string; email: string; password: string; name: string | null; avatar: string | null; broker: string | null; createdAt: string }, 'password'> & Record<string, unknown>) | undefined
}

export function getUserByEmail(email: string) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as { id: string; email: string; password: string; name: string | null; avatar: string | null; broker: string | null; createdAt: string } | undefined
}

export function createUser(id: string, email: string, hashedPassword: string, name: string | null) {
  db.prepare('INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)').run(id, email, hashedPassword, name)
}

export default db
