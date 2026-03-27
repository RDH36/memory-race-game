export type CpuDifficulty = "easy" | "medium" | "hard";

export interface LocalGameState {
  positions: number[];        // positions[gridIdx] = cardId
  cardEmojis: string[];       // cardEmojis[cardId] = emoji
  matchedBy: number[];        // -1 | 1 | 2
  selected: number[];         // max 2 cardIds currently selected
  scores: { p1: number; p2: number };
  tornadoUsed: { p1: boolean; p2: boolean };
  currentTurn: 1 | 2;
  locked: boolean;
  tornadoActive: boolean;
  tornadoSeed: number | null;
  status: "playing" | "finished";
}

// 8 animal emojis for pairs
export const EMOJIS = ['🐶','🐱','🐸','🦊','🐼','🦁','🐯','🦋'];

// Fisher-Yates standard shuffle
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Fisher-Yates seeded shuffle (deterministic PRNG)
// seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF
// rand = (seed >>> 0) / 0xFFFFFFFF
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;

  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    const rand = (s >>> 0) / 0xFFFFFFFF;
    const j = Math.floor(rand * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// Initialize a new game
export function initGame(): LocalGameState {
  const pairs = shuffle([...EMOJIS, ...EMOJIS]); // 16 cards
  return {
    positions: shuffle([...Array(16).keys()]),
    cardEmojis: pairs,
    matchedBy: Array(16).fill(-1),
    selected: [],
    scores: { p1: 0, p2: 0 },
    tornadoUsed: { p1: false, p2: false },
    currentTurn: 1,
    locked: false,
    tornadoActive: false,
    tornadoSeed: null,
    status: "playing",
  };
}

// Apply tornado shuffle to non-matched cards
export function applyTornadoShuffle(state: LocalGameState): number[] {
  // Get non-matched slots
  const nonMatchedSlots = state.positions.map((id, idx) => ({ id, idx }))
    .filter(x => state.matchedBy[x.id] === -1);
  const shuffledIds = seededShuffle(nonMatchedSlots.map(x => x.id), state.tornadoSeed!);
  const newPositions = [...state.positions];
  nonMatchedSlots.forEach(({ idx }, i) => { newPositions[idx] = shuffledIds[i]; });
  return newPositions;
}

// Check if all pairs are matched
export function isGameFinished(matchedBy: number[]): boolean {
  return matchedBy.every(v => v !== -1);
}

// Get available (non-matched) card IDs from positions
export function getAvailableCards(state: LocalGameState): number[] {
  return state.positions.filter(cardId => state.matchedBy[cardId] === -1);
}
