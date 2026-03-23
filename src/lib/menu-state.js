function sanitizeHash(hash) {
  return String(hash || '').replace(/^#/, '').trim()
}

export function resolveSectionFromHash(hash, validSectionIds = [], fallbackSectionId) {
  const next = sanitizeHash(hash)
  if (!next) {
    return fallbackSectionId
  }

  if (!Array.isArray(validSectionIds) || validSectionIds.length === 0) {
    return next
  }

  return validSectionIds.includes(next) ? next : fallbackSectionId
}

export function createHashSectionWatcher({
  windowRef,
  validSectionIds = [],
  fallbackSectionId,
  onSectionChange,
}) {
  const onChange = () => {
    const section = resolveSectionFromHash(windowRef.location.hash, validSectionIds, fallbackSectionId)
    onSectionChange(section)
  }

  onChange()
  windowRef.addEventListener('hashchange', onChange)

  return () => {
    windowRef.removeEventListener('hashchange', onChange)
  }
}