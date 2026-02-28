def get_response(user_input):
    user_input = user_input.lower().strip()

    if user_input == "hello" or user_input == "hi":
        return "Hi! How can I help you today?"
    elif user_input == "how are you":
        return "I'm fine, thanks! How about you?"
    elif user_input == "bye" or user_input == "goodbye":
        return "Goodbye! Have a great day!"
    elif user_input == "quit":
        return "quit"
    else:
        return "Sorry, I don't understand that. Try 'hello', 'how are you', or 'bye'."

print("Chatbot: Hello! Say 'hello', 'how are you', 'bye', or 'quit' to exit.")

while True:
    user_message = input("You: ")
    response = get_response(user_message)

    print(f"Chatbot: {response}")

    if response == "quit":
        break
