import { submitContactToApi } from './api-client'

function sanitizeText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function validateContactInput(input) {
  const name = sanitizeText(input?.name)
  const email = sanitizeText(input?.email).toLowerCase()
  const message = sanitizeText(input?.message)
  const consent = Boolean(input?.consent)
  const company = sanitizeText(input?.company)

  if (company) {
    return { ok: false, error: 'Soumission invalide detectee.' }
  }

  if (name.length < 2) {
    return { ok: false, error: 'Le nom est trop court.' }
  }

  if (!isValidEmail(email)) {
    return { ok: false, error: 'Adresse email invalide.' }
  }

  if (message.length < 20) {
    return {
      ok: false,
      error: 'Le message doit contenir au moins 20 caracteres.',
    }
  }

  if (!consent) {
    return {
      ok: false,
      error: 'Le consentement est requis pour etre recontacte.',
    }
  }

  return {
    ok: true,
    payload: {
      name,
      email,
      message,
    },
  }
}

function getContactStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }

  return window.localStorage
}

export async function submitContactMessage(payload, storage = getContactStorage()) {
  const submittedAt = new Date().toISOString()
  const safePayload = {
    name: sanitizeText(payload?.name),
    email: sanitizeText(payload?.email).toLowerCase(),
    message: sanitizeText(payload?.message),
  }

  try {
    await submitContactToApi({ ...safePayload, consent: true })
    return { stored: true, submittedAt, mode: 'api' }
  } catch {
    // Local fallback keeps the contact form usable when API is unavailable.
  }

  if (!storage) {
    return { stored: false, submittedAt }
  }

  const key = 'portfolio-contact-messages'
  const raw = storage.getItem(key)
  const previous = raw ? JSON.parse(raw) : []
  const next = [{ ...safePayload, submittedAt }, ...previous].slice(0, 20)

  storage.setItem(key, JSON.stringify(next))

  return { stored: true, submittedAt, mode: 'local' }
}
