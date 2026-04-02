import { useEffect, useRef } from "react";
import type { LocalGameState, CpuDifficulty } from "../lib/gameLogic";
import { isGameFinished } from "../lib/gameLogic";
import { updateRoomGameState, type RoomData } from "../lib/roomLogic";
import { cpuDecide, updateMemory, type CpuMemory } from "../lib/cpuLogic";

const BOT_DELAY = 800;
const BOT_FLIP_DELAY = 600;
const RESOLVE_DELAY = 800;

/**
 * Simulates a ghost player (bot) in an online room.
 * The bot plays as guest (player 2) by updating room gameState in InstantDB.
 * Handles the full cycle: decide → flip card 1 → flip card 2 → resolve match.
 */
export function useBotPlayer(
  room: RoomData | null,
  game: LocalGameState | null,
  difficulty: CpuDifficulty,
  enabled: boolean,
) {
  const memoryRef = useRef<CpuMemory>({});
  const actingRef = useRef(false);

  // Observe cards flipped by the real player to build bot memory
  useEffect(() => {
    if (!enabled || !game || game.currentTurn === 2) return;
    for (const cardId of game.selected) {
      memoryRef.current = updateMemory(
        memoryRef.current,
        cardId,
        game.cardEmojis[cardId],
        difficulty,
      );
    }
  }, [game?.selected, enabled, difficulty]);

  // Clear memory after tornado
  useEffect(() => {
    if (!enabled || !game) return;
    if (!game.tornadoActive && game.tornadoSeed === null) return;
    if (!game.tornadoActive) {
      memoryRef.current = {};
    }
  }, [game?.tornadoActive, enabled]);

  // Bot plays when it's player 2's turn
  useEffect(() => {
    if (
      !enabled ||
      !game ||
      !room ||
      !room.guestId ||
      game.currentTurn !== 2 ||
      game.locked ||
      game.tornadoActive ||
      game.status !== "playing" ||
      actingRef.current
    )
      return;

    actingRef.current = true;

    const timer = setTimeout(() => {
      const decision = cpuDecide(game, memoryRef.current, difficulty);

      if (decision.action === "tornado") {
        const seed = Date.now() & 0xffff;
        const newState: LocalGameState = {
          ...game,
          tornadoUsed: { ...game.tornadoUsed, p2: true },
          tornadoSeed: seed,
          tornadoActive: true,
          selected: [],
          locked: true,
          currentTurn: 1,
        };
        updateRoomGameState(room.id, newState, room.hostId);
        actingRef.current = false;
        return;
      }

      if (!decision.cards) {
        actingRef.current = false;
        return;
      }

      const [first, second] = decision.cards;

      // Update bot memory for the cards it's about to flip
      memoryRef.current = updateMemory(memoryRef.current, first, game.cardEmojis[first], difficulty);
      memoryRef.current = updateMemory(memoryRef.current, second, game.cardEmojis[second], difficulty);

      // Step 1: Flip first card
      const stateAfterFirst: LocalGameState = {
        ...game,
        selected: [first],
      };
      updateRoomGameState(room.id, stateAfterFirst, room.guestId!);

      // Step 2: Flip second card
      setTimeout(() => {
        const stateAfterSecond: LocalGameState = {
          ...game,
          selected: [first, second],
          locked: true,
        };
        updateRoomGameState(room.id, stateAfterSecond, room.guestId!);

        // Step 3: Resolve the match after a delay
        setTimeout(() => {
          resolveBot(game, room, first, second);
          actingRef.current = false;
        }, RESOLVE_DELAY);
      }, BOT_FLIP_DELAY);
    }, BOT_DELAY);

    return () => {
      clearTimeout(timer);
      actingRef.current = false;
    };
  }, [game?.currentTurn, game?.locked, game?.tornadoActive, game?.status, enabled, difficulty]);
}

/** Resolve a bot flip: update scores/turn and write back to room */
function resolveBot(
  game: LocalGameState,
  room: RoomData,
  cardA: number,
  cardB: number,
) {
  const isMatch = game.cardEmojis[cardA] === game.cardEmojis[cardB];

  if (isMatch) {
    const newMatchedBy = [...game.matchedBy];
    newMatchedBy[cardA] = 2;
    newMatchedBy[cardB] = 2;
    const newScores = { ...game.scores, p2: game.scores.p2 + 1 };
    const finished = isGameFinished(newMatchedBy);

    const newState: LocalGameState = {
      ...game,
      matchedBy: newMatchedBy,
      scores: newScores,
      selected: [],
      locked: false,
      status: finished ? "finished" : "playing",
      // Stay on turn 2 (bot gets another turn on match)
      currentTurn: 2,
    };

    const nextPlayerId = room.guestId!;
    const finishedData = finished
      ? {
          winnerId:
            newScores.p1 > newScores.p2
              ? room.hostId
              : newScores.p2 > newScores.p1
                ? room.guestId!
                : undefined,
        }
      : undefined;

    updateRoomGameState(room.id, newState, nextPlayerId, finishedData);
  } else {
    const newState: LocalGameState = {
      ...game,
      selected: [],
      locked: false,
      currentTurn: 1,
    };

    updateRoomGameState(room.id, newState, room.hostId);
  }
}
