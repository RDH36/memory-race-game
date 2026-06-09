import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import * as Haptics from "expo-haptics";
import {
  type LocalGameState,
  type PlayerAbility,
  TORNADO_ABILITY,
  applyTornadoShuffle,
  isGameFinished,
} from "../lib/gameLogic";
import { abilityEffect } from "../lib/abilities";
import { applyPower } from "../lib/powerEffects";
import {
  updateRoomGameState,
  type RoomData,
} from "../lib/roomLogic";
import { playFlip, playMatch } from "../lib/sound";

const FLIP_DELAY = 800;
const FEEDBACK_DURATION = 900;
const FREEZE_DELAY = 650;

export type MatchResult = {
  type: "match" | "mismatch";
  player: 1 | 2;
  cards: [number, number];
} | null;

export function useOnlineGame(
  room: RoomData | null,
  myUserId: string | undefined,
  isBotMode: boolean = false,
  myAbility: PlayerAbility = TORNADO_ABILITY,
) {
  const [lastMatchResult, setLastMatchResult] = useState<MatchResult>(null);
  const [revealedLocal, setRevealedLocal] = useState<number[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const revealTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevSelectedRef = useRef<number[]>([]);
  const resolvingRef = useRef(false);
  const syncedRef = useRef(false);

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
  const myKey = isHost ? "p1" : "p2";
  const myCaster: 1 | 2 = isHost ? 1 : 2;
  const myTurn = game
    ? (isHost && game.currentTurn === 1) ||
      (!isHost && game.currentTurn === 2)
    : false;

  const effect = useMemo(() => abilityEffect(myAbility.id, myAbility.level), [myAbility.id, myAbility.level]);

  // --- Sync my equipped ability into the shared state once per game ---
  useEffect(() => {
    if (!game || !room || syncedRef.current || game.status !== "playing") return;
    const mine = game.abilities?.[myKey];
    if (mine && mine.id === myAbility.id && mine.level === myAbility.level) {
      syncedRef.current = true;
      return;
    }
    syncedRef.current = true;
    updateRoomGameState(
      room.id,
      {
        ...game,
        abilities: { ...game.abilities, [myKey]: myAbility },
        powerUsesLeft: { ...game.powerUsesLeft, [myKey]: effect.uses },
      },
      room.currentPlayerId!,
    );
  }, [game?.abilities?.[myKey]?.id, room?.id]);

  // --- Detect match resolution (when 2 cards selected + locked) ---
  useEffect(() => {
    if (!game || !room || game.selected.length !== 2 || !game.locked) return;
    if (!myTurn) return;
    if (resolvingRef.current) return;
    resolvingRef.current = true;

    const [a, b] = game.selected;
    const isMatch = game.cardEmojis[a] === game.cardEmojis[b];

    timeoutRef.current = setTimeout(() => {
      const newState = { ...game };

      if (isMatch) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        playMatch();
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
        // "shield" power: keep the turn instead of passing it on a miss.
        const useShield = game.shieldCharges[myKey] > 0;
        Object.assign(newState, {
          selected: [],
          locked: false,
          currentTurn: useShield ? game.currentTurn : game.currentTurn === 1 ? 2 : 1,
          ...(useShield && { shieldCharges: { ...game.shieldCharges, [myKey]: game.shieldCharges[myKey] - 1 } }),
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
      resolvingRef.current = false;

      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(
        () => setLastMatchResult(null),
        FEEDBACK_DURATION,
      );
    }, FLIP_DELAY);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      resolvingRef.current = false;
    };
  }, [game?.selected?.length, game?.locked]);

  // --- "freeze" power: if it's my turn but I'm frozen, skip and hand over ---
  useEffect(() => {
    if (!game || !room || !myTurn || isBotMode) return;
    if (game.locked || game.tornadoActive || game.status !== "playing") return;
    if (game.freezeTurns[myKey] <= 0) return;

    const t = setTimeout(() => {
      updateRoomGameState(
        room.id,
        {
          ...game,
          freezeTurns: { ...game.freezeTurns, [myKey]: game.freezeTurns[myKey] - 1 },
          currentTurn: isHost ? 2 : 1,
        },
        isHost ? room.guestId! : room.hostId,
      );
    }, FREEZE_DELAY);
    return () => clearTimeout(t);
  }, [game?.currentTurn, game?.freezeTurns?.[myKey], myTurn]);

  // --- Track selection changes for haptics on opponent moves ---
  useEffect(() => {
    if (!game) return;
    const prev = prevSelectedRef.current;
    if (game.selected.length > prev.length && !myTurn) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      playFlip();
    }
    prevSelectedRef.current = [...game.selected];
  }, [game?.selected]);

  // Refs for stable handleCardPress (avoids memo invalidation in CardItem)
  const gameRef = useRef(game);
  const roomRef = useRef(room);
  const myTurnRef = useRef(myTurn);
  useEffect(() => {
    gameRef.current = game;
    roomRef.current = room;
    myTurnRef.current = myTurn;
  });

  // --- Card press ---
  const handleCardPress = useCallback((cardId: number) => {
    const g = gameRef.current;
    const r = roomRef.current;
    if (!g || !r || !myTurnRef.current) return;
    if (
      g.locked ||
      g.tornadoActive ||
      g.matchedBy[cardId] !== -1 ||
      g.selected.includes(cardId) ||
      g.selected.length >= 2 ||
      g.status !== "playing"
    )
      return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playFlip();

    const newSelected = [...g.selected, cardId];
    const isSecondCard = newSelected.length === 2;

    updateRoomGameState(
      r.id,
      { ...g, selected: newSelected, locked: isSecondCard },
      r.currentPlayerId!,
    );
  }, []);

  // --- Equipped-ability power ---
  const handlePower = useCallback(() => {
    if (!game || !room || !myTurn) return;
    if (game.locked || game.tornadoActive || game.status !== "playing") return;
    if (game.powerUsesLeft[myKey] <= 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const seed = Date.now() & 0xffff;
    const res = applyPower(game, effect, seed, myCaster);

    // "reveal" stays private — shown only on my client, never synced.
    if (res.revealMs > 0) {
      setRevealedLocal(res.revealCards);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      revealTimerRef.current = setTimeout(() => setRevealedLocal([]), res.revealMs);
    }

    // No-op power (e.g. steal with nothing to take) — don't write.
    if (Object.keys(res.patch).length === 0) return;

    const newState: LocalGameState = {
      ...game,
      ...res.patch,
      tornadoUsed: { ...game.tornadoUsed, [myKey]: true },
    };
    const nextPlayerId = newState.currentTurn === 1 ? room.hostId : room.guestId!;
    updateRoomGameState(room.id, newState, nextPlayerId);
  }, [game, room, myTurn, myKey, myCaster, effect]);

  // --- Tornado/shuffle overlay complete ---
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

    const iAmNext =
      (isHost && game.currentTurn === 1) ||
      (!isHost && game.currentTurn === 2);
    if (iAmNext || (isBotMode && isHost)) {
      updateRoomGameState(room.id, newState, room.currentPlayerId!);
    }
  }, [game, room, isHost, isBotMode]);

  return {
    game,
    room,
    isHost,
    myTurn,
    lastMatchResult,
    revealedLocal,
    handleCardPress,
    handlePower,
    handleTornadoComplete,
  };
}
