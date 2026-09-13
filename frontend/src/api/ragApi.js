export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function backendUnavailableError() {
  return new Error('Unable to reach the local AI backend.')
}

async function readErrorDetail(response) {
  try {
    const data = await response.json()
    const detail = data?.detail

    if (typeof detail === 'string' && detail.trim()) {
      return detail
    }

    if (Array.isArray(detail) && typeof detail[0]?.msg === 'string') {
      return detail[0].msg
    }
  } catch {
    // Ignore invalid JSON bodies.
  }

  return null
}

async function throwForFailedResponse(response) {
  const detail = await readErrorDetail(response)

  if (detail) {
    throw new Error(detail)
  }

  if (response.status === 400 || response.status === 422) {
    throw new Error('The request was invalid.')
  }

  throw backendUnavailableError()
}

async function postJson(path, body) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw backendUnavailableError()
  }

  if (!response.ok) {
    await throwForFailedResponse(response)
  }

  try {
    return await response.json()
  } catch {
    throw backendUnavailableError()
  }
}

export async function queryRAG(query) {
  const data = await postJson('/api/rag/query', { query })

  if (typeof data?.answer !== 'string' || !Array.isArray(data?.sources)) {
    throw backendUnavailableError()
  }

  return data
}

export async function uploadRAGDocument(file) {
  const formData = new FormData()
  formData.append('file', file)

  let response

  try {
    response = await fetch(`${API_BASE_URL}/api/rag/upload`, {
      method: 'POST',
      body: formData,
    })
  } catch {
    throw backendUnavailableError()
  }

  if (!response.ok) {
    await throwForFailedResponse(response)
  }

  try {
    return await response.json()
  } catch {
    throw backendUnavailableError()
  }
}

export async function pingBackend() {
  let response

  try {
    response = await fetch(`${API_BASE_URL}/openapi.json`)
  } catch {
    return false
  }

  return Boolean(response?.ok)
}

export async function ingestRAGDocuments() {
  let response

  try {
    response = await fetch(`${API_BASE_URL}/api/rag/ingest`, {
      method: 'POST',
    })
  } catch {
    throw backendUnavailableError()
  }

  if (!response.ok) {
    await throwForFailedResponse(response)
  }

  try {
    return await response.json()
  } catch {
    throw backendUnavailableError()
  }
}

