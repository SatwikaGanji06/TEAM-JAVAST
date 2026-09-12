from urllib.parse import urlparse


# Only local services required by the AI Workbench
ALLOWED_HOSTS = {
    "localhost",
    "127.0.0.1"
}

ALLOWED_PORTS = {
    11434  # Ollama
}


def is_local_request(url: str) -> bool:
    """
    Check whether a URL points to an approved local service.
    """

    try:
        parsed = urlparse(url)

        host = parsed.hostname
        port = parsed.port

        if host not in ALLOWED_HOSTS:
            return False

        if port not in ALLOWED_PORTS:
            return False

        return True

    except ValueError:
        return False


def check_network_request(url: str) -> bool:
    """
    Return True if the request is allowed,
    otherwise return False.
    """

    return is_local_request(url)

def enforce_network_policy(url: str) -> None:
    """
    Enforce the network policy.

    Raises PermissionError if the destination
    is not an approved local service.
    """

    if not check_network_request(url):
        raise PermissionError(
            f"External network request blocked: {url}"
        )


# Temporary testing
if __name__ == "__main__":

    test_urls = [
        "http://localhost:11434/api/chat",
        "http://127.0.0.1:11434/api/chat",
        "https://google.com",
        "https://api.openai.com/v1/chat/completions",
        "http://192.168.1.10:11434/api/chat"
    ]

    for url in test_urls:
        result = check_network_request(url)

        print(
            f"{'ALLOWED' if result else 'BLOCKED'} : {url}"
        )