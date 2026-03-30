import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import * as Haptics from "expo-haptics";
import {
  type LocalGameState,
  type CpuDifficulty,
  applyTornadoShuffle,
  isGameFinished,
} from "../lib/gameLogic";
import {
  updateRoomGameState,
  type RoomData,
} from "../lib/roomLogic";

const FLIP_DELAY = 800;
const FEEDBACK_DURATION = 900;

export type MatchResult = {
  type: "match" | "mismatch";
  player: 1 | 2;
  cards: [number, number];
} | null;

export function useOnlineGame(
  room: RoomData | null,
  myUserId: string | undefined,
) {
  const [lastMatchResult, setLastMatchResult] = useState<MatchResult>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevSelectedRef = useRef<number[]>([]);

  const game: LocalGameState | null = useMemo(() => {
    if (!room?.gameState) return null;
    try {
      return JSON.parse(room.gameState) as LocalGameState;
    } catch {
      return null;
    }
  }, [room?.gameState]);

  // Determine if I'm player 1 (host) or player 2 (guest)
  const isHost = myUserId === room?.hostId;
  const myTurn = game
    ? (isHost && game.currentTurn === 1) ||
      (!isHost && game.currentTurn === 2)
    : false;

  // --- Detect match resolution (when 2 cards selected + locked) ---
  useEffect(() => {
    if (!game || !room || game.selected.length !== 2 || !game.locked) return;

    // Only the player whose turn it is resolves the match
    if (!myTurn) return;

    const [a, b] = game.selected;
    const isMatch = game.cardEmojis[a] === game.cardEmojis[b];

    timeoutRef.current = setTimeout(() => {
      const newState = { ...game };

      if (isMatch) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const player = game.currentTurn === 1 ? "p1" : "p2";
        const newMatchedBy = [...game.matchedBy];
        newMatchedBy[a] = game.currentTurn;
        newMatchedBy[b] = game.currentTurn;
        const newScores = { ...game.scores, [player]: game.scores[player] + 1 };
        const finished = isGameFinished(newMatchedBy);

        const isP1 = game.currentTurn === 1;
        Object.assign(newState, {
          matchedBy: newMatchedBy,
          scores: newScores,
          selected: [],
          locked: false,
          status: finished ? "finished" : "playing",
          ...(isP1 && {
            p1Attempts: game.p1Attempts + 1,
            p1Streak: game.p1Streak + 1,
            p1MaxStreak: Math.max(game.p1MaxStreak, game.p1Streak + 1),
          }),
        });

        setLastMatchResult({ type: "match", player: game.currentTurn, cards: [a, b] });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        const isP1 = game.currentTurn === 1;
        Object.assign(newState, {
          selected: [],
          locked: false,
          currentTurn: game.currentTurn === 1 ? 2 : 1,
          ...(isP1 && { p1Attempts: game.p1Attempts + 1, p1Streak: 0 }),
        });

        setLastMatchResult({ type: "mismatch", player: game.currentTurn, cards: [a, b] });
      }

      const nextPlayerId =
        newState.currentTurn === 1 ? room.hostId : room.guestId!;
      const finished =
        newState.status === "finished"
          ? {
              winnerId:
                newState.scores.p1 > newState.scores.p2
                  ? room.hostId
                  : newState.scores.p2 > newState.scores.p1
                    ? room.guestId!
                    : undefined,
            }
          : undefined;

      updateRoomGameState(room.id, newState, nextPlayerId, finished);

      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(
        () => setLastMatchResult(null),
        FEEDBACK_DURATION,
      );
    }, FLIP_DELAY);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [game?.selected?.length, game?.locked]);

  // --- Detect opponent's match result for feedback ---
  useEffect(() => {
    if (!game || game.selected.length !== 0 || myTurn) return;
    // When opponent resolves (selected goes back to 0), we show feedback based on matchedBy changes
    // This is handled by the state update propagation
  }, [game?.selected]);

  // --- Track selection changes for haptics on opponent moves ---
  useEffect(() => {
    if (!game) return;
    const prev = prevSelectedRef.current;
    if (game.selected.length > prev.length && !myTurn) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    prevSelectedRef.current = [...game.selected];
  }, [game?.selected]);

  // --- P1 card press ---
  const handleCardPress = useCallback(
    (cardId: number) => {
      if (!game || !room || !myTurn) return;
      if (
        game.locked ||
        game.tornadoActive ||
        game.matchedBy[cardId] !== -1 ||
        game.selected.includes(cardId) ||
        game.selected.length >= 2 ||
        game.status !== "playing"
      )
        return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const newSelected = [...game.selected, cardId];
      const isSecondCard = newSelected.length === 2;

      const newState: LocalGameState = {
        ...game,
        selected: newSelected,
        locked: isSecondCard,
      };

      updateRoomGameState(room.id, newState, room.currentPlayerId!);
    },
    [game, room, myTurn],
  );

  // --- Tornado ---
  const handleTornado = useCallback(() => {
    if (!game || !room || !myTurn) return;
    if (
      game.locked ||
      game.tornadoActive ||
      game.status !== "playing"
    )
      return;

    const tornadoKey = isHost ? "p1" : "p2";
    if (game.tornadoUsed[tornadoKey]) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const seed = Date.now() & 0xffff;
    const nextTurn = game.currentTurn === 1 ? 2 : 1;
    const nextPlayerId = nextTurn === 1 ? room.hostId : room.guestId!;

    const newState: LocalGameState = {
      ...game,
      tornadoUsed: { ...game.tornadoUsed, [tornadoKey]: true },
      tornadoSeed: seed,
      tornadoActive: true,
      selected: [],
      locked: true,
      currentTurn: nextTurn as 1 | 2,
    };

    updateRoomGameState(room.id, newState, nextPlayerId);
  }, [game, room, myTurn, isHost]);

  // --- Tornado complete ---
  const handleTornadoComplete = useCallback(() => {
    if (!game || !room) return;

    const newPositions = applyTornadoShuffle(game);
    const newState: LocalGameState = {
      ...game,
      positions: newPositions,
      tornadoActive: false,
      locked: false,
      tornadoSeed: null,
    };

    // Only the player whose turn it NOW is writes the completion
    const iAmNext =
      (isHost && game.currentTurn === 1) ||
      (!isHost && game.currentTurn === 2);
    if (iAmNext) {
      updateRoomGameState(room.id, newState, room.currentPlayerId!);
    }
  }, [game, room, isHost]);

  return {
    game,
    room,
    isHost,
    myTurn,
    lastMatchResult,
    handleCardPress,
    handleTornado,
    handleTornadoComplete,
  };
}
