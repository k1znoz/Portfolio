// @vitest-environment node

import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createDatabase } from './db.js'
import { createApp } from './index.js'

const ADMIN_TEST_KEY = 'test-admin-key'

let app
let db
let tempDir

beforeAll(async () => {
  tempDir = await mkdtemp(path.join(tmpdir(), 'portfolio-api-test-'))
  const dbFile = path.join(tempDir, 'api-test.sqlite')

  db = await createDatabase({ filename: dbFile })
  const context = await createApp({ db, adminApiKey: ADMIN_TEST_KEY })
  app = context.app
})

afterAll(async () => {
  if (db) {
    await db.close()
  }

  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true })
  }
})

describe('API integration', () => {
  it('returns 200 on health route', async () => {
    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body.ok).toBe(true)
  })

  it('returns 400 for invalid contact payload', async () => {
    const response = await request(app).post('/api/contact').send({
      name: 'A',
      email: 'invalid-mail',
      message: 'court',
      consent: false,
    })

    expect(response.status).toBe(400)
    expect(response.body.error).toMatch(/invalid/i)
  })

  it('returns 401 on protected admin route without api key', async () => {
    const response = await request(app).get('/api/contact')

    expect(response.status).toBe(401)
    expect(response.body.error).toMatch(/unauthorized/i)
  })

  it('returns 200 on protected admin route with valid api key', async () => {
    const response = await request(app)
      .get('/api/contact')
      .set('x-admin-key', ADMIN_TEST_KEY)

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body.items)).toBe(true)
  })
})
