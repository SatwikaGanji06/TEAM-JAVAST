import pytest
import requests
from unittest.mock import patch, MagicMock
from rag.generation import generate, GenerationError

def test_generate_success():
    """Verify that a valid response is extracted correctly."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"response": "  This is a generated answer.  "}

    with patch("requests.post", return_value=mock_response):
        result = generate("What is AI?")
        assert result == "This is a generated answer."

def test_generate_payload():
    """Verify that the exact prompt and model are sent to Ollama."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"response": "OK"}

    with patch("requests.post", return_value=mock_response) as mock_post:
        generate("Specific Prompt")

        # Get the arguments of the first call to requests.post
        args, kwargs = mock_post.call_args
        payload = kwargs.get("json", {})

        assert payload["prompt"] == "Specific Prompt"
        assert payload["model"] == "qwen3:4b"
        assert payload["stream"] is False

def test_generate_invalid_prompts():
    """Verify that invalid prompts are rejected with ValueError."""
    # None prompt
    with pytest.raises(ValueError, match="Prompt cannot be None"):
        generate(None)

    # Non-string prompt
    with pytest.raises(ValueError, match="Prompt must be a string"):
        generate(123)

    # Empty prompt
    with pytest.raises(ValueError, match="Prompt cannot be empty"):
        generate("")

    # Whitespace-only prompt
    with pytest.raises(ValueError, match="Prompt cannot be empty"):
        generate("   ")

def test_generate_connection_error():
    """Verify that connection errors are wrapped in GenerationError."""
    with patch("requests.post", side_effect=requests.exceptions.ConnectionError):
        with pytest.raises(GenerationError, match="Could not connect to Ollama service"):
            generate("Valid prompt")

def test_generate_timeout():
    """Verify that timeout errors are wrapped in GenerationError."""
    with patch("requests.post", side_effect=requests.exceptions.Timeout):
        with pytest.raises(GenerationError, match="Request to Ollama service timed out"):
            generate("Valid prompt")

def test_generate_http_error():
    """Verify that HTTP errors (4xx, 5xx) are handled."""
    mock_response = MagicMock()
    mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError("500 Internal Server Error")

    with patch("requests.post", return_value=mock_response):
        with pytest.raises(GenerationError, match="Ollama API returned an HTTP error"):
            generate("Valid prompt")

def test_generate_malformed_json():
    """Verify that non-JSON responses are handled."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.side_effect = ValueError("Invalid JSON")

    with patch("requests.post", return_value=mock_response):
        with pytest.raises(GenerationError, match="Failed to parse the response"):
            generate("Valid prompt")

def test_generate_missing_response_field():
    """Verify that responses missing the 'response' field are handled."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"wrong_field": "some text"}

    with patch("requests.post", return_value=mock_response):
        with pytest.raises(GenerationError, match="Malformed JSON response: 'response' field is missing"):
            generate("Valid prompt")
