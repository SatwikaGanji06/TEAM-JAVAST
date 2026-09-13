from backend.router import route_request


if __name__ == "__main__":

    print("===================================")
    print("       TEAM JAVAST AI BACKEND")
    print("===================================")
    print("Model Router: Online")
    print("Text Model: Qwen3 4B")
    print("Conversation History: Enabled")
    print("Ollama: Connected locally")
    print("Type 'exit' to stop.\n")

    conversation = []

    while True:

        question = input("You: ").strip()

        if question.lower() == "exit":
            break

        if not question:
            continue

        try:

            # Add user message to conversation
            conversation.append({
                "role": "user",
                "content": question
            })

            # Send conversation history to router
            result = route_request(
                messages=conversation,
                request_type="text"
            )

            answer = result["response"]

            # Add assistant response to conversation
            conversation.append({
                "role": "assistant",
                "content": answer
            })

            print("\nQwen:", answer)
            print()

        except Exception as e:
            print(f"\nError: {e}\n")
