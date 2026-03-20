async function parseJsonResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return null
  }

  return response.json()
}

/**
 * @param {string} path
 * @param {{ method?: string, body?: unknown, adminKey?: string }} [options]
 */
async function apiRequest(path, options = {}) {
  const { method = 'GET', body, adminKey } = options
  /** @type {Record<string, string>} */
  const headers = {}

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (adminKey) {
    headers['x-admin-key'] = adminKey
  }

  const response = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const payload = await parseJsonResponse(response)

  if (!response.ok) {
    throw new Error(payload?.error || 'Requete API impossible.')
  }

  return payload
}

export async function fetchProjects() {
  const payload = await apiRequest('/api/projects')
  return payload?.items || []
}

export async function submitContactToApi(input) {
  return apiRequest('/api/contact', { method: 'POST', body: input })
}

export async function adminFetchProjects(adminKey) {
  const payload = await apiRequest('/api/projects', { adminKey })
  return payload?.items || []
}

export async function adminCreateProject(adminKey, projectPayload) {
  const payload = await apiRequest('/api/projects', {
    method: 'POST',
    body: projectPayload,
    adminKey,
  })

  return payload?.item
}

export async function adminUpdateProject(adminKey, projectId, projectPayload) {
  const payload = await apiRequest(`/api/projects/${projectId}`, {
    method: 'PUT',
    body: projectPayload,
    adminKey,
  })

  return payload?.item
}

export async function adminDeleteProject(adminKey, projectId) {
  await apiRequest(`/api/projects/${projectId}`, {
    method: 'DELETE',
    adminKey,
  })
}

export async function adminFetchContactMessages(adminKey) {
  const payload = await apiRequest('/api/contact', { adminKey })
  return payload?.items || []
}
