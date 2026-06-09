// Pure resolution of an equipped-ability power against the game state.
// Player-aware (caster 1 = host/p1, caster 2 = guest/p2) so the same logic
// drives both the local (vs CPU) and online (synced) games.
import type { AbilityEffect } from "./abilities";
import { shuffle, type LocalGameState } from "./gameLogic";

/**
 * Pick up to `n` random non-matched, non-selected cards to flip face-up.
 * Cards are random on purpose — the player still has to MEMORIZE them and
 * find the pairs on their own, so the memory challenge stays intact.
 */
export function pickRevealCards(state: LocalGameState, n: number): number[] {
  const pool = state.positions.filter(
    (cardId) => state.matchedBy[cardId] === -1 && !state.selected.includes(cardId),
  );
  return shuffle(pool).slice(0, Math.min(n, pool.length));
}

/** Card ids of up to `count` pairs currently owned (matched) by `ownerNum`. */
function pickStealPairs(state: LocalGameState, ownerNum: number, count: number): number[] {
  const byEmoji = new Map<string, number[]>();
  state.matchedBy.forEach((owner, cardId) => {
    if (owner !== ownerNum) return;
    const emoji = state.cardEmojis[cardId];
    const list = byEmoji.get(emoji) ?? [];
    list.push(cardId);
    byEmoji.set(emoji, list);
  });
  const pairs = shuffle([...byEmoji.values()].filter((ids) => ids.length >= 2));
  const result: number[] = [];
  for (const ids of pairs) {
    if (result.length / 2 >= count) break;
    result.push(ids[0], ids[1]);
  }
  return result;
}

export interface PowerResult {
  patch: Partial<LocalGameState>;
  /** True when the caller should run the shuffle overlay (TornadoOverlay). */
  shuffle: boolean;
  /** Cards to reveal — kept OUT of the synced patch so reveal stays private;
   *  the caller decides where to store them (local state). */
  revealCards: number[];
  /** > 0 → the caller schedules clearing the reveal after this many ms. */
  revealMs: number;
}

const EMPTY: PowerResult = { patch: {}, shuffle: false, revealCards: [], revealMs: 0 };

/** Resolve a power activation by `caster` (1 = p1, 2 = p2) into a patch. */
export function applyPower(
  state: LocalGameState,
  effect: AbilityEffect,
  seed: number,
  caster: 1 | 2,
): PowerResult {
  const me = caster === 1 ? "p1" : "p2";
  const other = caster === 1 ? "p2" : "p1";
  const otherNum = caster === 1 ? 2 : 1;
  const base = {
    powerUsesLeft: { ...state.powerUsesLeft, [me]: state.powerUsesLeft[me] - 1 },
  };

  switch (effect.kind) {
    case "reveal":
      return {
        patch: { ...base },
        shuffle: false,
        revealCards: pickRevealCards(state, effect.revealCount),
        revealMs: effect.revealMs,
      };
    case "freeze":
      return {
        ...EMPTY,
        patch: {
          ...base,
          freezeTurns: { ...state.freezeTurns, [other]: state.freezeTurns[other] + effect.freezeTurns },
        },
      };
    case "shield":
      return {
        ...EMPTY,
        patch: {
          ...base,
          shieldCharges: { ...state.shieldCharges, [me]: state.shieldCharges[me] + effect.shieldCharges },
        },
      };
    case "steal": {
      const stolen = pickStealPairs(state, otherNum, effect.stealCount);
      // No-op (keep the use) if the opponent has no completed pairs yet.
      if (stolen.length === 0) return EMPTY;
      const matchedBy = [...state.matchedBy];
      stolen.forEach((cardId) => { matchedBy[cardId] = caster; });
      const pairs = stolen.length / 2;
      return {
        ...EMPTY,
        patch: {
          ...base,
          matchedBy,
          scores: { ...state.scores, [me]: state.scores[me] + pairs, [other]: state.scores[other] - pairs },
        },
      };
    }
    case "shuffle":
    default:
      return {
        ...EMPTY,
        shuffle: true,
        patch: {
          ...base,
          tornadoActive: true,
          tornadoSeed: seed,
          selected: [],
          locked: true,
          currentTurn: effect.keepTurn ? state.currentTurn : (otherNum as 1 | 2),
        },
      };
  }
}
