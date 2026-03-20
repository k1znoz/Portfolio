import { describe, expect, it } from 'vitest'
import {
  submitContactMessage,
  validateContactInput,
} from './contact-form'

describe('validateContactInput', () => {
  it('returns an error when consent is missing', () => {
    const result = validateContactInput({
      name: 'Alois',
      email: 'alois@test.com',
      message: 'Je souhaite discuter du projet portfolio CDA.',
      consent: false,
      company: '',
    })

    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/consentement/i)
  })

  it('accepts valid data and returns a sanitized payload', () => {
    const result = validateContactInput({
      name: '  Alois   Sautet ',
      email: '  ALOIS@TEST.COM ',
      message: '   Message de prise de contact pour une collaboration serieuse.  ',
      consent: true,
      company: '',
    })

    expect(result.ok).toBe(true)
    expect(result.payload).toEqual({
      name: 'Alois Sautet',
      email: 'alois@test.com',
      message: 'Message de prise de contact pour une collaboration serieuse.',
    })
  })
})

describe('submitContactMessage', () => {
  it('stores the payload in provided storage', async () => {
    const storage = {
      values: new Map(),
      get length() {
        return this.values.size
      },
      clear() {
        this.values.clear()
      },
      getItem(key) {
        return this.values.get(key) ?? null
      },
      key(index) {
        return Array.from(this.values.keys())[index] ?? null
      },
      removeItem(key) {
        this.values.delete(key)
      },
      setItem(key, value) {
        this.values.set(key, value)
      },
    }

    const response = await submitContactMessage(
      {
        name: 'Alois',
        email: 'alois@test.com',
        message: 'Message long pour verifier la persistence locale.',
      },
      storage
    )

    const saved = JSON.parse(storage.getItem('portfolio-contact-messages'))

    expect(response.stored).toBe(true)
    expect(saved).toHaveLength(1)
    expect(saved[0].email).toBe('alois@test.com')
    expect(saved[0].submittedAt).toBeTruthy()
  })
})
