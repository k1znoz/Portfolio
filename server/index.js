import express from 'express'
import { fileURLToPath } from 'url'

import { createDatabase, mapProjectRow } from './db.js'

const API_PORT = Number(process.env.API_PORT || 8787)
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'change-me-in-production'

function sanitizeText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function createAdminGuard(adminApiKey) {
  return function assertAdmin(req, res, next) {
    const received = req.header('x-admin-key')

    if (!received || received !== adminApiKey) {
      res.status(401).json({ error: 'Unauthorized.' })
      return
    }

    next()
  }
}

export async function createApp(options = {}) {
  const db = options.db || (await createDatabase())
  const adminApiKey = options.adminApiKey || ADMIN_API_KEY
  const assertAdmin = createAdminGuard(adminApiKey)

  const app = express()
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'portfolio-api' })
  })

  app.get('/api/projects', async (_req, res) => {
    const rows = await db.all('SELECT * FROM projects ORDER BY id DESC')
    res.json({ items: rows.map(mapProjectRow) })
  })

  app.post('/api/projects', assertAdmin, async (req, res) => {
    const date = sanitizeText(req.body?.date)
    const name = sanitizeText(req.body?.name)
    const type = sanitizeText(req.body?.type)
    const summary = sanitizeText(req.body?.summary)
    const imageUrl = sanitizeText(req.body?.image) || null
    const liveUrl = sanitizeText(req.body?.links?.live) || null
    const sourceUrl = sanitizeText(req.body?.links?.source)
    const demoMode = sanitizeText(req.body?.demo?.mode) || null
    const demoGame = sanitizeText(req.body?.demo?.game) || null
    const demoPath = sanitizeText(req.body?.demo?.path) || null
    const demoUrl = sanitizeText(req.body?.demo?.url) || null

    if (!date || !name || !type || !summary || !sourceUrl) {
      res.status(400).json({ error: 'Missing required project fields.' })
      return
    }

    try {
      const result = await db.run(
        `
      INSERT INTO projects (
        date, name, type, summary, image_url, live_url, source_url, demo_mode, demo_game, demo_path, demo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        date,
        name,
        type,
        summary,
        imageUrl,
        liveUrl,
        sourceUrl,
        demoMode,
        demoGame,
        demoPath,
        demoUrl
      )

      const created = await db.get('SELECT * FROM projects WHERE id = ?', result.lastID)
      res.status(201).json({ item: mapProjectRow(created) })
    } catch {
      res.status(409).json({ error: 'Project insertion failed.' })
    }
  })

  app.put('/api/projects/:id', assertAdmin, async (req, res) => {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid project id.' })
      return
    }

    const date = sanitizeText(req.body?.date)
    const name = sanitizeText(req.body?.name)
    const type = sanitizeText(req.body?.type)
    const summary = sanitizeText(req.body?.summary)
    const imageUrl = sanitizeText(req.body?.image) || null
    const liveUrl = sanitizeText(req.body?.links?.live) || null
    const sourceUrl = sanitizeText(req.body?.links?.source)
    const demoMode = sanitizeText(req.body?.demo?.mode) || null
    const demoGame = sanitizeText(req.body?.demo?.game) || null
    const demoPath = sanitizeText(req.body?.demo?.path) || null
    const demoUrl = sanitizeText(req.body?.demo?.url) || null

    if (!date || !name || !type || !summary || !sourceUrl) {
      res.status(400).json({ error: 'Missing required project fields.' })
      return
    }

    const result = await db.run(
      `
    UPDATE projects
    SET date = ?, name = ?, type = ?, summary = ?, image_url = ?, live_url = ?, source_url = ?, demo_mode = ?,
        demo_game = ?, demo_path = ?, demo_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    `,
      date,
      name,
      type,
      summary,
      imageUrl,
      liveUrl,
      sourceUrl,
      demoMode,
      demoGame,
      demoPath,
      demoUrl,
      id
    )

    if (!result.changes) {
      res.status(404).json({ error: 'Project not found.' })
      return
    }

    const updated = await db.get('SELECT * FROM projects WHERE id = ?', id)
    res.json({ item: mapProjectRow(updated) })
  })

  app.delete('/api/projects/:id', assertAdmin, async (req, res) => {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid project id.' })
      return
    }

    const result = await db.run('DELETE FROM projects WHERE id = ?', id)

    if (!result.changes) {
      res.status(404).json({ error: 'Project not found.' })
      return
    }

    res.status(204).send()
  })

  app.post('/api/contact', async (req, res) => {
    const name = sanitizeText(req.body?.name)
    const email = sanitizeText(req.body?.email).toLowerCase()
    const message = sanitizeText(req.body?.message)
    const consent = Boolean(req.body?.consent)

    if (name.length < 2 || message.length < 20 || !isValidEmail(email) || !consent) {
      res.status(400).json({ error: 'Invalid contact payload.' })
      return
    }

    await db.run(
      `
    INSERT INTO contact_messages (name, email, message, consent_given, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
      name,
      email,
      message,
      consent ? 1 : 0,
      req.ip ?? null,
      sanitizeText(req.header('user-agent')) || null
    )

    res.status(201).json({ ok: true })
  })

  app.get('/api/contact', assertAdmin, async (_req, res) => {
    const rows = await db.all(
      'SELECT id, name, email, message, consent_given, ip_address, user_agent, created_at FROM contact_messages ORDER BY id DESC LIMIT 100'
    )

    res.json({
      items: rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        message: row.message,
        consentGiven: Boolean(row.consent_given),
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        createdAt: row.created_at,
      })),
    })
  })

  return { app, db }
}

export async function startServer(options = {}) {
  const port = options.port ?? API_PORT
  const { app, db } = await createApp(options)

  const server = app.listen(port, () => {
    console.log(`[portfolio-api] listening on http://localhost:${port}`)
  })

  return { app, db, server }
}

const entryFilePath = process.argv[1]
const currentModulePath = fileURLToPath(import.meta.url)

if (entryFilePath && currentModulePath === entryFilePath) {
  await startServer()
}
