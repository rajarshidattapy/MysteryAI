// src/utils/difficulty.js

// Difficulty enum mapping (matches Solidity enum)
export const Difficulty = {
  Easy: 0,
  Medium: 1,
  Hard: 2
};

// Points awarded per difficulty level
export const DIFFICULTY_POINTS = {
  [Difficulty.Easy]: 3,
  [Difficulty.Medium]: 5,
  [Difficulty.Hard]: 7
};

// Difficulty labels for UI display
export const DIFFICULTY_LABELS = {
  [Difficulty.Easy]: "Easy",
  [Difficulty.Medium]: "Medium",
  [Difficulty.Hard]: "Hard"
};

// Difficulty colors for badges
export const DIFFICULTY_COLORS = {
  [Difficulty.Easy]: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/20"
  },
  [Difficulty.Medium]: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/20"
  },
  [Difficulty.Hard]: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20"
  }
};

/**
 * Get points for a given difficulty level
 * @param {number} difficulty - Difficulty enum value (0, 1, or 2)
 * @returns {number} Points awarded
 */
export const getPointsForDifficulty = (difficulty) => {
  return DIFFICULTY_POINTS[difficulty] || 0;
};

/**
 * Get label for a given difficulty level
 * @param {number} difficulty - Difficulty enum value (0, 1, or 2)
 * @returns {string} Difficulty label
 */
export const getDifficultyLabel = (difficulty) => {
  return DIFFICULTY_LABELS[difficulty] || "Unknown";
};

/**
 * Get color classes for difficulty badge
 * @param {number} difficulty - Difficulty enum value (0, 1, or 2)
 * @returns {object} Color classes
 */
export const getDifficultyColors = (difficulty) => {
  return DIFFICULTY_COLORS[difficulty] || {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/20"
  };
};

/**
 * Randomly select a difficulty level
 * @returns {number} Random difficulty (0, 1, or 2)
 */
export const getRandomDifficulty = () => {
  const difficulties = [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard];
  return difficulties[Math.floor(Math.random() * difficulties.length)];
};

