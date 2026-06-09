import { LocalGameState, CpuDifficulty, getAvailableCards } from './gameLogic';

export type CpuMemory = Record<number, string>; // cardId → emoji

export interface CpuAction {
  action: 'power' | 'flip';
  cards?: [number, number];
}

const MEMORY_RATE: Record<CpuDifficulty, number> = {
  easy: 0.2,
  medium: 0.55,
  hard: 0.85,
};

const POWER_THRESHOLD: Record<CpuDifficulty, number> = {
  easy: 0.7,
  medium: 0.4,
  hard: 0.1,
};

// True if player `owner` (1|2) has at least one completed pair on the board.
function hasOwnedPairs(game: LocalGameState, owner: number): boolean {
  return game.matchedBy.filter((m) => m === owner).length >= 2;
}

// Update CPU memory when a card is revealed
// Only remembers based on difficulty rate
export function updateMemory(
  memory: CpuMemory,
  cardId: number,
  emoji: string,
  difficulty: CpuDifficulty
): CpuMemory {
  if (Math.random() < MEMORY_RATE[difficulty]) {
    return { ...memory, [cardId]: emoji };
  }
  return memory;
}

// Find a known pair in memory among available cards
function findKnownPair(
  available: number[],
  memory: CpuMemory,
): [number, number] | null {
  const availableSet = new Set(available);
  const emojiToCards: Record<string, number[]> = {};

  for (const [cardIdStr, emoji] of Object.entries(memory)) {
    const cardId = Number(cardIdStr);
    if (!availableSet.has(cardId)) continue;
    if (!emojiToCards[emoji]) emojiToCards[emoji] = [];
    emojiToCards[emoji].push(cardId);
  }

  for (const cards of Object.values(emojiToCards)) {
    if (cards.length >= 2) return [cards[0], cards[1]];
  }
  return null;
}

// Pick random cards, preferring unknowns
function pickRandomCards(
  available: number[],
  memory: CpuMemory,
  count: number,
): number[] {
  const unknown = available.filter(id => !(id in memory));
  const pool = unknown.length >= count ? unknown : available;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Main CPU decision function. `powerKind` is the CPU's equipped ability kind
// (so it won't try to "steal" when the player has no pairs to take).
export function cpuDecide(
  game: LocalGameState,
  memory: CpuMemory,
  difficulty: CpuDifficulty,
  powerKind?: string,
): CpuAction {
  // Power decision — use the equipped ability when the player is pulling ahead.
  const stealUseless = powerKind === "steal" && !hasOwnedPairs(game, 1);
  if (
    game.powerUsesLeft.p2 > 0 &&
    game.scores.p1 >= 3 &&
    !stealUseless &&
    Math.random() > POWER_THRESHOLD[difficulty]
  ) {
    return { action: 'power' };
  }

  const available = getAvailableCards(game);

  // Try to find a known pair
  const knownPair = findKnownPair(available, memory);
  if (knownPair) {
    return { action: 'flip', cards: knownPair };
  }

  // Random pick
  const picks = pickRandomCards(available, memory, 2);
  return { action: 'flip', cards: [picks[0], picks[1]] };
}
