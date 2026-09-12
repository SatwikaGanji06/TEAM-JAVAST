import requests


OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "qwen3:4b"


def ask_qwen(prompt):
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "stream": False
        },
        timeout=120
    )

    response.raise_for_status()

    data = response.json()

    return data["message"]["content"]


if __name__ == "__main__":

    print("TEAM JAVAST - Qwen3 4B")
    print("Connected to local Ollama")
    print("Type 'exit' to stop.\n")

    while True:

        question = input("You: ").strip()

        if not question:
            continue

        if question.lower() == "exit":
            break

        try:
            answer = ask_qwen(question)

            print("\nQwen:", answer)
            print()

        except requests.exceptions.Timeout:
            print("\nError: Qwen took too long to respond.\n")

        except requests.exceptions.ConnectionError:
            print("\nError: Could not connect to Ollama.\n")

        except Exception as e:
            print(f"\nError: {e}\n")