import { abilityEffect } from "./abilities";

export type CpuDifficulty = "easy" | "medium" | "hard";

/** Per-player counter (p1 = host/human, p2 = guest/CPU). */
export interface PerPlayer { p1: number; p2: number }

/** A player's equipped ability, mirrored into the shared state so both
 *  clients can render the build and resolve effects. */
export interface PlayerAbility {
  id: string;
  level: number;
  emoji: string;
  nameKey: string;
}

export const TORNADO_ABILITY: PlayerAbility = { id: "tornado", level: 1, emoji: "🌪️", nameKey: "tornado" };

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
  p1Attempts: number;
  p1Streak: number;
  p1MaxStreak: number;
  // --- Equipped-ability powers (per player) ---
  powerUsesLeft: PerPlayer;   // activations remaining this game
  freezeTurns: PerPlayer;     // turns each player must still skip ("freeze")
  shieldCharges: PerPlayer;   // mismatch protections left ("shield")
  abilities: { p1: PlayerAbility; p2: PlayerAbility };
  // Transient visual; only ever set locally for the casting client (never
  // written to a synced room — keeps "reveal" private from the opponent).
  revealed: number[];
}

// All available emojis for card pairs
const ALL_EMOJIS = ['🐶','🐱','🐸','🦊','🐼','🦁','🐯','🦋','🐰','🐨','🐷','🦄','🐵','🦉','🐢','🦀'];

// Grid configuration per difficulty
export const GRID_CONFIG: Record<CpuDifficulty, { cols: number; totalCards: number }> = {
  easy:   { cols: 4, totalCards: 12 },  // 4×3, 6 pairs
  medium: { cols: 4, totalCards: 16 },  // 4×4, 8 pairs
  hard:   { cols: 4, totalCards: 24 },  // 4×6, 12 pairs
};

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

// Initialize a new game. Each player's equipped ability configures their
// power (uses count, etc.); both default to the tornado when omitted.
export function initGame(
  difficulty: CpuDifficulty = 'medium',
  p1Ability: PlayerAbility = TORNADO_ABILITY,
  p2Ability: PlayerAbility = TORNADO_ABILITY,
): LocalGameState {
  const config = GRID_CONFIG[difficulty];
  const numPairs = config.totalCards / 2;
  const emojis = ALL_EMOJIS.slice(0, numPairs);
  const pairs = shuffle([...emojis, ...emojis]);
  const p1Uses = abilityEffect(p1Ability.id, p1Ability.level).uses;
  const p2Uses = abilityEffect(p2Ability.id, p2Ability.level).uses;
  return {
    positions: shuffle([...Array(config.totalCards).keys()]),
    cardEmojis: pairs,
    matchedBy: Array(config.totalCards).fill(-1),
    selected: [],
    scores: { p1: 0, p2: 0 },
    tornadoUsed: { p1: false, p2: false },
    currentTurn: 1,
    locked: false,
    tornadoActive: false,
    tornadoSeed: null,
    status: "playing",
    p1Attempts: 0,
    p1Streak: 0,
    p1MaxStreak: 0,
    powerUsesLeft: { p1: p1Uses, p2: p2Uses },
    freezeTurns: { p1: 0, p2: 0 },
    shieldCharges: { p1: 0, p2: 0 },
    abilities: { p1: p1Ability, p2: p2Ability },
    revealed: [],
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
