export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001'
  
export async function sendChatMessage(message) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      try {
        const errorData = await response.json()
        const detail = errorData?.detail

        if (typeof detail === 'string' && detail.trim()) {
          throw new Error(detail)
        }
      } catch (error) {
        if (error instanceof Error && error.message.trim()) {
          throw error
        }
      }

      throw new Error('Unable to reach the local AI backend.')
    }

    const data = await response.json()

    if (typeof data?.response !== 'string') {
      throw new Error('Invalid response from the local AI backend.')
    }

    return data
  } catch (error) {
    if (error instanceof Error && error.message.trim()) {
      throw error
    }

    throw new Error('Unable to reach the local AI backend.')
  }
}



