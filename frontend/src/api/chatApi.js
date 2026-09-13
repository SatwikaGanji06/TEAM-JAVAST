export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'


export async function sendChatMessage(message) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  })

  if (!response.ok) {
    let detail = null

    try {
      const data = await response.json()
      detail = data?.detail
    } catch {
      // Ignore invalid JSON.
    }

    throw new Error(
      typeof detail === 'string'
        ? detail
        : 'Unable to reach the local AI backend.',
    )
  }

  const data = await response.json()

  if (typeof data?.response !== 'string') {
    throw new Error(
      'The local AI backend returned an invalid response.',
    )
  }

  return data
}


export async function generateApprovalNote(message) {
  const response = await fetch(
    `${API_BASE_URL}/api/approval-note`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    },
  )

  if (!response.ok) {
    let detail = null

    try {
      const data = await response.json()
      detail = data?.detail
    } catch {
      // Ignore invalid JSON.
    }

    throw new Error(
      typeof detail === 'string'
        ? detail
        : 'Unable to generate the document.',
    )
  }

  return response.blob()
}