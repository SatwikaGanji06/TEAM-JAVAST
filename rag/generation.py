import os
import requests
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
GENERATION_MODEL = os.getenv("GENERATION_MODEL", "qwen3:4b")

class GenerationError(Exception):
    """Custom exception for errors occurring during the generation process."""
    pass

def generate(prompt: str) -> str:
    """
    Sends a prompt to the local Ollama generation model and returns the response.

    Args:
        prompt: The fully constructed prompt string.

    Returns:
        The generated response text as a stripped string.

    Raises:
        ValueError: If the prompt is None, non-string, or empty.
        GenerationError: If there is a failure in communicating with Ollama
                         or parsing the response.
    """
    # 1. Input Validation
    if prompt is None:
        raise ValueError("Prompt cannot be None.")

    if not isinstance(prompt, str):
        raise ValueError(f"Prompt must be a string, got {type(prompt).__name__}.")

    if not prompt.strip():
        raise ValueError("Prompt cannot be empty or whitespace-only.")

    # 2. Request Preparation
    payload = {
        "model": GENERATION_MODEL,
        "prompt": prompt,
        "stream": False
    }

    try:
        # 3. Call Ollama API
        response = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=120
        )

        # Handle HTTP errors (4xx, 5xx)
        response.raise_for_status()

        # 4. Parse Response
        data = response.json()

        if "response" not in data:
            raise GenerationError("Malformed JSON response: 'response' field is missing.")

        return data["response"].strip()

    except requests.exceptions.ConnectionError:
        raise GenerationError("Could not connect to Ollama service. Please ensure it is running.")
    except requests.exceptions.Timeout:
        raise GenerationError("Request to Ollama service timed out.")
    except requests.exceptions.HTTPError as e:
        raise GenerationError(f"Ollama API returned an HTTP error: {e}")
    except requests.exceptions.RequestException as e:
        raise GenerationError(f"An unexpected error occurred during the request: {e}")
    except (ValueError, KeyError):
        raise GenerationError("Failed to parse the response from Ollama as valid JSON.")
