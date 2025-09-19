// Game constants for various games

// Freeze Cat Game Constants
export const FREEZE_CAT = {
  GRID_SIZE: 3,
  INITIAL_APPEAR_INTERVAL: 2000, // 2 seconds
  MIN_APPEAR_INTERVAL: 800, // 0.8 seconds
  GAME_DURATION: 20000, // 20 seconds
  COUNTDOWN_DURATION: 3, // 3 second countdown
  SCORE_INCREMENT: 10, // Points for correct tap
  SCORE_PENALTY: 5, // Points deducted for tapping cat
  ANIMAL_DISPLAY_TIME: 2000, // How long animals stay visible (2 seconds)
  DIFFICULTY_THRESHOLD: 5, // Score threshold to increase difficulty
} as const;

// Animal types for Freeze Cat
export const ANIMALS = {
  CAT: '🐱', // The forbidden animal
  OTHERS: ['🐶', '🐰', '🐼', '🐸', '🐷', '🐮', '🦊', '🐻'] // Animals to tap
} as const;

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3
} as const;

// Letter-Sound Matching Game Constants
export const LETTER_SOUND = {
  COUNTDOWN_DURATION: 3, // 3 second countdown
  TOTAL_ROUNDS: 7, // A through G
  SCORE_INCREMENT: 1, // Points per correct answer
  ROUND_DELAY: 1000, // 1 second delay after correct answer
  CARD_COUNT: 4, // Number of cards to show (1 correct + 3 distractors)
} as const;

// Letter-Sound Items (A through G)
export const LETTER_SOUND_ITEMS = [
  { letter: "A", word: "Apple", image: "/assets/letters/apple.png" },
  { letter: "B", word: "Ball", image: "/assets/letters/ball.png" },
  { letter: "C", word: "Cat", image: "/assets/letters/cat.png" },
  { letter: "D", word: "Dog", image: "/assets/letters/dog.png" },
  { letter: "E", word: "Egg", image: "/assets/letters/egg.png" },
  { letter: "F", word: "Fish", image: "/assets/letters/fish.png" },
  { letter: "G", word: "Grapes", image: "/assets/letters/grapes.png" },
] as const;

// Symbol Spotter Constants (existing)
export const SYMBOL_SPOTTER = {
  GAME_DURATION: 100000, // 100 seconds
  COUNTDOWN_DURATION: 3,
  CENTER_BOX_SIZE: 350,
  SPAWN_RATE_MIN: 300,
  SPAWN_RATE_MAX: 800
} as const;
