import random

# Predefined list of 5 words
words = ["python", "hangman", "guessing", "letter", "simple"]

# Select a random word and initialize game state
secret_word = random.choice(words).lower()
word_letters = set(secret_word)  # Unique letters in the word
guessed_letters = set()  # Letters the player has guessed
wrong_guesses = 0  # Track incorrect guesses (max 6)

print("Welcome to Hangman! Guess the word one letter at a time.")
print(f"Word has {len(secret_word)} letters: {' _ ' * len(secret_word)}")
print("You have 6 incorrect guesses allowed.\n")

# Main game loop
while wrong_guesses < 6 and word_letters:
    # Get player input
    guess = input("Guess a letter: ").lower().strip()

    # Validate input
    if len(guess) != 1 or not guess.isalpha():
        print("Please enter a single letter.\n")
        continue
    if guess in guessed_letters:
        print("You already guessed that letter.\n")
        continue

    guessed_letters.add(guess)

    # Check if guess is correct
    if guess in word_letters:
        word_letters.remove(guess)
        print(f"Good guess! Current: {' '.join(c if c in guessed_letters else '_' for c in secret_word)}\n")
    else:
        wrong_guesses += 1
        remaining = 6 - wrong_guesses
        print(f"Wrong guess! {remaining} incorrect guesses left.\n")

# Determine win/lose
if word_letters:
    print(f"You lost! The word was '{secret_word}'.")
else:
    print(f"Congratulations! You guessed the word '{secret_word}'!")
