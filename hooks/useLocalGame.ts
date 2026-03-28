import { useState, useCallback, useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import {
  LocalGameState,
  CpuDifficulty,
  initGame,
  applyTornadoShuffle,
  isGameFinished,
} from "../lib/gameLogic";
import { CpuMemory, cpuDecide, updateMemory } from "../lib/cpuLogic";

const FLIP_DELAY = 800;
const CPU_DELAY = 600;
const FEEDBACK_DURATION = 900;

export type MatchResult = {
  type: "match" | "mismatch";
  player: 1 | 2;
  cards: [number, number];
} | null;

export function useLocalGame(difficulty: CpuDifficulty) {
  const [game, setGame] = useState<LocalGameState>(() => initGame(difficulty));
  const [lastMatchResult, setLastMatchResult] = useState<MatchResult>(null);
  const cpuMemoryRef = useRef<CpuMemory>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const update = useCallback(
    (patch: Partial<LocalGameState>) =>
      setGame((g) => ({ ...g, ...patch })),
    [],
  );

  // --- P1 card press ---
  const handleCardPress = useCallback(
    (cardId: number) => {
      setGame((g) => {
        if (
          g.currentTurn !== 1 ||
          g.locked ||
          g.tornadoActive ||
          g.matchedBy[cardId] !== -1 ||
          g.selected.includes(cardId) ||
          g.selected.length >= 2 ||
          g.status !== "playing"
        )
          return g;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const newSelected = [...g.selected, cardId];

        // CPU observes flipped card
        cpuMemoryRef.current = updateMemory(
          cpuMemoryRef.current,
          cardId,
          g.cardEmojis[cardId],
          difficulty,
        );

        if (newSelected.length === 2) {
          return { ...g, selected: newSelected, locked: true };
        }
        return { ...g, selected: newSelected };
      });
    },
    [difficulty],
  );

  // --- Resolve 2 selected cards ---
  useEffect(() => {
    if (game.selected.length !== 2 || !game.locked) return;

    const [a, b] = game.selected;
    const isMatch = game.cardEmojis[a] === game.cardEmojis[b];

    timeoutRef.current = setTimeout(() => {
      if (isMatch) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const player = game.currentTurn === 1 ? "p1" : "p2";
        const newMatchedBy = [...game.matchedBy];
        newMatchedBy[a] = game.currentTurn;
        newMatchedBy[b] = game.currentTurn;
        const newScores = {
          ...game.scores,
          [player]: game.scores[player] + 1,
        };
        const finished = isGameFinished(newMatchedBy);
        setLastMatchResult({ type: "match", player: game.currentTurn, cards: [a, b] });

        // Track P1 stats
        const isP1 = game.currentTurn === 1;
        const newStreak = isP1 ? game.p1Streak + 1 : game.p1Streak;
        const newMaxStreak = isP1 ? Math.max(game.p1MaxStreak, newStreak) : game.p1MaxStreak;

        update({
          matchedBy: newMatchedBy,
          scores: newScores,
          selected: [],
          locked: false,
          status: finished ? "finished" : "playing",
          ...(isP1 && {
            p1Attempts: game.p1Attempts + 1,
            p1Streak: newStreak,
            p1MaxStreak: newMaxStreak,
          }),
        });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setLastMatchResult({ type: "mismatch", player: game.currentTurn, cards: [a, b] });

        const isP1 = game.currentTurn === 1;
        update({
          selected: [],
          locked: false,
          currentTurn: game.currentTurn === 1 ? 2 : 1,
          ...(isP1 && {
            p1Attempts: game.p1Attempts + 1,
            p1Streak: 0,
          }),
        });
      }
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => setLastMatchResult(null), FEEDBACK_DURATION);
    }, FLIP_DELAY);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [game.selected, game.locked]);

  // --- CPU turn ---
  useEffect(() => {
    if (
      game.currentTurn !== 2 ||
      game.locked ||
      game.tornadoActive ||
      game.status !== "playing"
    )
      return;

    timeoutRef.current = setTimeout(() => {
      const decision = cpuDecide(game, cpuMemoryRef.current, difficulty);

      if (decision.action === "tornado") {
        handleCpuTornado();
        return;
      }

      if (decision.cards) {
        executeCpuFlip(decision.cards);
      }
    }, CPU_DELAY);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [game.currentTurn, game.locked, game.tornadoActive, game.status]);

  const executeCpuFlip = useCallback(
    (cards: [number, number]) => {
      const [first, second] = cards;

      // Flip first card
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setGame((g) => ({ ...g, selected: [first] }));

      // Update our own memory for card we just flipped
      setGame((g) => {
        cpuMemoryRef.current = updateMemory(
          cpuMemoryRef.current,
          first,
          g.cardEmojis[first],
          difficulty,
        );
        return g;
      });

      // Flip second card after delay
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setGame((g) => {
          cpuMemoryRef.current = updateMemory(
            cpuMemoryRef.current,
            second,
            g.cardEmojis[second],
            difficulty,
          );
          return { ...g, selected: [first, second], locked: true };
        });
      }, CPU_DELAY);
    },
    [difficulty],
  );

  // --- P1 tornado ---
  const handleTornado = useCallback(() => {
    setGame((g) => {
      if (
        g.currentTurn !== 1 ||
        g.tornadoUsed.p1 ||
        g.locked ||
        g.tornadoActive ||
        g.status !== "playing"
      )
        return g;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const seed = Date.now() & 0xffff;
      return {
        ...g,
        tornadoUsed: { ...g.tornadoUsed, p1: true },
        tornadoSeed: seed,
        tornadoActive: true,
        selected: [],
        locked: true,
        currentTurn: 2,
      };
    });
  }, []);

  // --- CPU tornado ---
  const handleCpuTornado = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const seed = Date.now() & 0xffff;
    update({
      tornadoUsed: { ...game.tornadoUsed, p2: true },
      tornadoSeed: seed,
      tornadoActive: true,
      selected: [],
      locked: true,
      currentTurn: 1,
    });
  }, [game.tornadoUsed]);

  // --- Tornado complete ---
  const handleTornadoComplete = useCallback(() => {
    setGame((g) => {
      const newPositions = applyTornadoShuffle(g);
      // Clear CPU memory after tornado (cards moved)
      cpuMemoryRef.current = {};
      return {
        ...g,
        positions: newPositions,
        tornadoActive: false,
        locked: false,
        tornadoSeed: null,
      };
    });
  }, []);

  // --- Reset ---
  const resetGame = useCallback(() => {
    cpuMemoryRef.current = {};
    setGame(initGame(difficulty));
  }, []);

  return {
    game,
    lastMatchResult,
    handleCardPress,
    handleTornado,
    handleTornadoComplete,
    resetGame,
  };
}
