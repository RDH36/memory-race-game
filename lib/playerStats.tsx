import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { db } from "@/lib/instant";
import { id, tx } from "@instantdb/react-native";
import { useProfile } from "@/lib/identity";
import { usePremium } from "@/hooks/useEntitlements";

export interface PlayerStats {
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

// Soft currency ("or") earned per game — spent on the Builds page to
// unlock and upgrade abilities. Win pays more than a loss.
const GOLD_REWARDS: Record<string, { win: number; loss: number }> = {
  easy: { win: 12, loss: 4 },
  medium: { win: 20, loss: 6 },
  hard: { win: 32, loss: 8 },
};

// Flat coins premium players get every game (matches the free rewarded-ad bonus).
const PREMIUM_GOLD_BONUS = 50;

// AVATARS lives in lib/skins.ts (re-exported here for back-compat)
export { AVATARS } from "@/lib/skins";

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
  selectedTable: string;
  profileId: string | null;
  userId: string | undefined;
  /** Soft currency for the Builds page. */
  gold: number;
  /** Equipped ability id (defaults to "tornado"). */
  equippedAbility: string;
  /** Raw JSON map of owned abilities -> level (undefined when none). */
  abilitiesRaw: string | undefined;
  level: number;
  levelProgress: number;
  xpForNextLevel: number;
  xpInLevel: number;
  winRate: number;
  lastXpGain: number;
  lastGoldGain: number;
  recordGame: (won: boolean, difficulty?: string, gameData?: GameData, options?: RecordGameOptions) => void;
  addBonusXp: (amount: number) => void;
  addGold: (amount: number) => void;
}

const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0, gamesWon: 0, currentStreak: 0, bestStreak: 0, points: 0,
};

const Ctx = createContext<StatsContext | null>(null);

export function PlayerStatsProvider({ children }: { children: React.ReactNode }) {
  const [lastXpGain, setLastXpGain] = useState(0);
  const [lastGoldGain, setLastGoldGain] = useState(0);
  const premium = usePremium();

  const { user } = db.useAuth();
  const userId = user?.id;

  // Profile from InstantDB (nickname + avatar + selectedTable)
  const { profile } = useProfile(userId);
  const avatar = profile?.avatar ?? "🧠";
  const nickname = profile?.nickname ?? "";
  const selectedTable = profile?.selectedTable ?? "classic";
  const profileId = profile?.id ?? null;
  const gold = profile?.gold ?? 0;
  const equippedAbility = profile?.equippedAbility ?? "tornado";
  const abilitiesRaw = profile?.abilities ?? undefined;

  // Leaderboard from InstantDB (stats)
  const { data } = db.useQuery(
    userId ? { leaderboard: { $: { where: { userId } } } } : null,
  );
  const entry = data?.leaderboard?.[0];
  const leaderboardId = entry?.id ?? null;

  const stats: PlayerStats = useMemo(
    () =>
      entry
        ? {
            gamesPlayed: entry.gamesPlayed,
            gamesWon: entry.gamesWon,
            currentStreak: entry.currentStreak,
            bestStreak: entry.bestStreak,
            points: entry.points,
          }
        : DEFAULT_STATS,
    [
      entry?.gamesPlayed,
      entry?.gamesWon,
      entry?.currentStreak,
      entry?.bestStreak,
      entry?.points,
    ],
  );

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
    const premiumBoost = premium ? 1.1 : 1;
    const xp = Math.round(baseXp * (options?.xpBoost ?? 1) * premiumBoost);
    setLastXpGain(xp);

    const goldRewards = GOLD_REWARDS[difficulty] ?? GOLD_REWARDS.medium;
    // Rewarded-ad boost (+5%) for the in-mode ad. Premium players don't watch
    // ads, so they get the same flat +50 coins the free rewarded ad grants.
    const goldAdBoost = (options?.xpBoost ?? 1) > 1 ? 1.05 : 1;
    let goldEarned = Math.round((won ? goldRewards.win : goldRewards.loss) * goldAdBoost);
    if (premium) goldEarned += PREMIUM_GOLD_BONUS;
    setLastGoldGain(goldEarned);

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
      // Persist the gold reward on the profile (Builds currency).
      ops.push(tx.profiles[profileId].update({ gold: gold + goldEarned }));
    }

    db.transact(ops);
  }, [userId, stats, leaderboardId, profileId, premium, gold]);

  const addGold = useCallback((amount: number) => {
    if (!profileId) return;
    db.transact([tx.profiles[profileId].update({ gold: gold + amount })]);
  }, [profileId, gold]);

  const levelInfo = useMemo(() => computeLevel(stats.points), [stats.points]);

  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  const value = useMemo(
    () => ({
      stats, avatar, nickname, selectedTable, profileId, userId, winRate,
      gold, equippedAbility, abilitiesRaw,
      lastXpGain, lastGoldGain, recordGame, addBonusXp, addGold,
      level: levelInfo.level,
      levelProgress: levelInfo.progress,
      xpForNextLevel: levelInfo.xpForNext,
      xpInLevel: levelInfo.xpInLevel,
    }),
    [stats, avatar, nickname, selectedTable, profileId, userId, winRate, gold, equippedAbility, abilitiesRaw, lastXpGain, lastGoldGain, recordGame, addBonusXp, addGold, levelInfo],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlayerStats() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayerStats must be used within PlayerStatsProvider");
  return ctx;
}
