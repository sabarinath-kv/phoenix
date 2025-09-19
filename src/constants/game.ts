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

// Symbol Spotter Constants (existing)
export const SYMBOL_SPOTTER = {
  GAME_DURATION: 100000, // 100 seconds
  COUNTDOWN_DURATION: 3,
  CENTER_BOX_SIZE: 350,
  SPAWN_RATE_MIN: 300,
  SPAWN_RATE_MAX: 800
} as const;
