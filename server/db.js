import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

import { projects as defaultProjects } from '../src/data/portfolio.js'

function toDbProject(project) {
  return {
    date: project.date,
    name: project.name,
    type: project.type,
    summary: project.summary,
    imageUrl: project.image ?? null,
    liveUrl: project.links?.live ?? null,
    sourceUrl: project.links?.source ?? null,
    demoMode: project.demo?.mode ?? null,
    demoGame: project.demo?.game ?? null,
    demoPath: project.demo?.path ?? null,
    demoUrl: project.demo?.url ?? null,
  }
}

export async function createDatabase(options = {}) {
  const filename = options.filename || process.env.DB_FILE || './portfolio.db'

  const db = await open({
    filename,
    driver: sqlite3.Database,
  })

  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      name TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      summary TEXT NOT NULL,
      image_url TEXT,
      live_url TEXT,
      source_url TEXT NOT NULL,
      demo_mode TEXT,
      demo_game TEXT,
      demo_path TEXT,
      demo_url TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      consent_given INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Lightweight migration for existing local databases created before image_url existed.
  const projectColumns = await db.all('PRAGMA table_info(projects)')
  const hasImageColumn = projectColumns.some((column) => column.name === 'image_url')
  if (!hasImageColumn) {
    await db.exec('ALTER TABLE projects ADD COLUMN image_url TEXT')
  }

  const { count } = await db.get('SELECT COUNT(*) AS count FROM projects')
  if (!count) {
    const stmt = await db.prepare(`
      INSERT INTO projects (
        date, name, type, summary, image_url, live_url, source_url, demo_mode, demo_game, demo_path, demo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    try {
      for (const project of defaultProjects) {
        const normalized = toDbProject(project)
        await stmt.run(
          normalized.date,
          normalized.name,
          normalized.type,
          normalized.summary,
          normalized.imageUrl,
          normalized.liveUrl,
          normalized.sourceUrl,
          normalized.demoMode,
          normalized.demoGame,
          normalized.demoPath,
          normalized.demoUrl
        )
      }
    } finally {
      await stmt.finalize()
    }
  }

  // Backfill local screenshots for already-seeded rows missing image_url.
  const backfillStmt = await db.prepare(
    'UPDATE projects SET image_url = ? WHERE name = ? AND (image_url IS NULL OR image_url = "")'
  )

  try {
    for (const project of defaultProjects) {
      const normalized = toDbProject(project)
      if (!normalized.imageUrl) {
        continue
      }

      await backfillStmt.run(normalized.imageUrl, normalized.name)
    }
  } finally {
    await backfillStmt.finalize()
  }

  return db
}

export function mapProjectRow(row) {
  return {
    id: row.id,
    date: row.date,
    name: row.name,
    type: row.type,
    summary: row.summary,
    image: row.image_url,
    links: {
      live: row.live_url,
      source: row.source_url,
    },
    demo: row.demo_mode
      ? {
          mode: row.demo_mode,
          game: row.demo_game,
          path: row.demo_path,
          url: row.demo_url,
        }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
