import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { db } from "@/lib/instant";
import { id, tx } from "@instantdb/react-native";
import { useProfile } from "@/lib/identity";

interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  points: number;
}

const XP_REWARDS: Record<string, { win: number; loss: number }> = {
  easy: { win: 15, loss: 5 },
  medium: { win: 25, loss: 5 },
  hard: { win: 40, loss: 5 },
};

export const AVATARS = [
  "🧠", "🦊", "🐙", "🦉", "🐼", "🦁", "🐯", "🦄",
  "🐺", "🦅", "🐸", "🦋", "🐝", "🦈", "🐳", "🦩",
];

function computeLevel(xp: number) {
  let level = 1;
  let total = 0;
  while (true) {
    const needed = level * 75;
    if (xp < total + needed) {
      return { level, xpInLevel: xp - total, xpForNext: needed, progress: (xp - total) / needed };
    }
    total += needed;
    level++;
  }
}

interface GameData {
  scoreP1: number;
  scoreP2: number;
  duration: number;
  player2Type?: "cpu" | "human";
}

interface RecordGameOptions {
  xpBoost?: number;
}

interface StatsContext {
  stats: PlayerStats;
  avatar: string;
  nickname: string;
  profileId: string | null;
  userId: string | undefined;
  level: number;
  levelProgress: number;
  xpForNextLevel: number;
  xpInLevel: number;
  winRate: number;
  lastXpGain: number;
  recordGame: (won: boolean, difficulty?: string, gameData?: GameData, options?: RecordGameOptions) => void;
  addBonusXp: (amount: number) => void;
}

const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0, gamesWon: 0, currentStreak: 0, bestStreak: 0, points: 0,
};

const Ctx = createContext<StatsContext | null>(null);

export function PlayerStatsProvider({ children }: { children: React.ReactNode }) {
  const [lastXpGain, setLastXpGain] = useState(0);

  const { user } = db.useAuth();
  const userId = user?.id;

  // Profile from InstantDB (nickname + avatar)
  const { profile } = useProfile(userId);
  const avatar = profile?.avatar ?? "🧠";
  const nickname = profile?.nickname ?? "";
  const profileId = profile?.id ?? null;

  // Leaderboard from InstantDB (stats)
  const { data } = db.useQuery(
    userId ? { leaderboard: { $: { where: { userId } } } } : null,
  );
  const entry = data?.leaderboard?.[0];
  const leaderboardId = entry?.id ?? null;

  const stats: PlayerStats = entry
    ? {
        gamesPlayed: entry.gamesPlayed,
        gamesWon: entry.gamesWon,
        currentStreak: entry.currentStreak,
        bestStreak: entry.bestStreak,
        points: entry.points,
      }
    : DEFAULT_STATS;

  const addBonusXp = useCallback((amount: number) => {
    if (!userId) return;

    const lbId = leaderboardId ?? id();
    db.transact([
      tx.leaderboard[lbId].update({
        userId,
        gamesPlayed: stats.gamesPlayed,
        gamesWon: stats.gamesWon,
        currentStreak: stats.currentStreak,
        bestStreak: stats.bestStreak,
        points: stats.points + amount,
        updatedAt: Date.now(),
      }),
    ]);
    setLastXpGain(amount);
  }, [userId, stats, leaderboardId]);

  const recordGame = useCallback((won: boolean, difficulty = "medium", gameData?: GameData, options?: RecordGameOptions) => {
    if (!userId) return;

    const rewards = XP_REWARDS[difficulty] ?? XP_REWARDS.medium;
    const baseXp = won ? rewards.win : rewards.loss;
    const xp = Math.round(baseXp * (options?.xpBoost ?? 1));
    setLastXpGain(xp);

    const newStreak = won ? stats.currentStreak + 1 : 0;
    const newStats = {
      gamesPlayed: stats.gamesPlayed + 1,
      gamesWon: stats.gamesWon + (won ? 1 : 0),
      currentStreak: newStreak,
      bestStreak: Math.max(stats.bestStreak, newStreak),
      points: stats.points + xp,
    };

    const ops = [];

    const gameId = id();
    ops.push(
      tx.games[gameId].update({
        difficulty,
        winnerId: won ? userId : undefined,
        player1Id: userId,
        player2Type: gameData?.player2Type ?? "cpu",
        scoreP1: gameData?.scoreP1 ?? 0,
        scoreP2: gameData?.scoreP2 ?? 0,
        duration: gameData?.duration ?? 0,
        createdAt: Date.now(),
      }),
    );

    const lbId = leaderboardId ?? id();
    ops.push(
      tx.leaderboard[lbId].update({
        userId,
        ...newStats,
        updatedAt: Date.now(),
      }),
    );

    // Link leaderboard ↔ profile
    if (profileId) {
      ops.push(tx.leaderboard[lbId].link({ profile: profileId }));
      ops.push(tx.games[gameId].link({ player: profileId }));
    }

    db.transact(ops);
  }, [userId, stats, leaderboardId, profileId]);

  const levelInfo = useMemo(() => computeLevel(stats.points), [stats.points]);

  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  const value = useMemo(
    () => ({
      stats, avatar, nickname, profileId, userId, winRate, lastXpGain, recordGame, addBonusXp,
      level: levelInfo.level,
      levelProgress: levelInfo.progress,
      xpForNextLevel: levelInfo.xpForNext,
      xpInLevel: levelInfo.xpInLevel,
    }),
    [stats, avatar, nickname, profileId, userId, winRate, lastXpGain, recordGame, addBonusXp, levelInfo],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlayerStats() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayerStats must be used within PlayerStatsProvider");
  return ctx;
}
