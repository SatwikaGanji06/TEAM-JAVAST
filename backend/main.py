from router import route_request


if __name__ == "__main__":

    print("===================================")
    print("       TEAM JAVAST AI BACKEND")
    print("===================================")
    print("Model Router: Online")
    print("Text Model: Qwen3 4B")
    print("Ollama: Connected locally")
    print("Type 'exit' to stop.\n")

    while True:

        question = input("You: ").strip()

        if question.lower() == "exit":
            break

        if not question:
            continue

        try:

            answer = route_request(
                prompt=question,
                request_type="text"
            )

            print("\nQwen:", answer)
            print()

        except Exception as e:
            print(f"\nError: {e}\n")