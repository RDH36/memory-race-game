import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "@/lib/instant";
import { id, tx } from "@instantdb/react-native";
import { useProfile } from "@/lib/identity";
import { usePremium } from "@/hooks/useEntitlements";
import { localDayIndex, nextDayStreak } from "@/lib/dailyStreak";
import { nextQuestCounters } from "@/lib/questPeriods";
import { computeLevel } from "@/lib/leveling";
import { XP_REWARDS, GOLD_REWARDS, PREMIUM_GOLD_BONUS } from "@/lib/economy";
import { track } from "@/lib/analytics";
import type { QuestProfile } from "@/lib/questCatalog";
import { DEFAULT_STATS, type GameData, type PlayerStats, type RecordGameOptions } from "@/lib/playerStatsTypes";

export type { PlayerStats } from "@/lib/playerStatsTypes";

// AVATARS lives in lib/skins.ts (re-exported here for back-compat)
export { AVATARS } from "@/lib/skins";

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
  /** Raw JSON of story campaign progress (see lib/campaign). */
  storyProgressRaw: string | undefined;
  /** Hearts for story-campaign retries. */
  lives: number;
  /** All quest-related raw profile fields (daily/weekly/achievements). */
  questData: QuestProfile;
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
  addLives: (amount: number) => void;
  spendLife: () => boolean;
}

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
  const storyProgressRaw = profile?.storyProgress ?? undefined;
  const lives = profile?.lives ?? 0;

  // Starter hearts: +3 once post-onboarding (field undefined until then).
  useEffect(() => {
    if (!profileId || profile?.lives !== undefined) return;
    AsyncStorage.getItem("onboarding_complete").then((v) => {
      if (v === "true") db.transact([tx.profiles[profileId].update({ lives: 3 })]);
    });
  }, [profileId, profile?.lives]);
  const dayStreak = profile?.dayStreak ?? 0;
  const lastPlayedDay = profile?.lastPlayedDay ?? undefined;
  const questData: QuestProfile = useMemo(
    () => ({
      claimedQuestsRaw: profile?.claimedQuests ?? undefined,
      dayStreak: profile?.dayStreak ?? 0,
      dailyPeriod: profile?.dailyPeriod ?? undefined,
      dailyGames: profile?.dailyGames ?? 0,
      dailyWins: profile?.dailyWins ?? 0,
      claimedDailyRaw: profile?.claimedDaily ?? undefined,
      weeklyPeriod: profile?.weeklyPeriod ?? undefined,
      weeklyGames: profile?.weeklyGames ?? 0,
      weeklyWins: profile?.weeklyWins ?? 0,
      claimedWeeklyRaw: profile?.claimedWeekly ?? undefined,
    }),
    [profile?.claimedQuests, profile?.dayStreak, profile?.dailyPeriod, profile?.dailyGames, profile?.dailyWins, profile?.claimedDaily, profile?.weeklyPeriod, profile?.weeklyGames, profile?.weeklyWins, profile?.claimedWeekly],
  );

  const { data } = db.useQuery( // leaderboard stats
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
    track("game_played", { difficulty, won, mode: gameData?.player2Type === "human" ? "online" : "solo" });

    const rewards = XP_REWARDS[difficulty] ?? XP_REWARDS.medium;
    const baseXp = won ? rewards.win : rewards.loss;
    const premiumBoost = premium ? 1.1 : 1;
    const xp = Math.round(baseXp * (options?.xpBoost ?? 1) * premiumBoost);
    setLastXpGain(xp);

    const goldRewards = GOLD_REWARDS[difficulty] ?? GOLD_REWARDS.medium;
    const goldAdBoost = (options?.xpBoost ?? 1) > 1 ? 1.05 : 1; // +5% in-mode rewarded ad
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
      // Persist gold + daily-streak + daily/weekly quest counters.
      const today = localDayIndex();
      ops.push(tx.profiles[profileId].update({
        gold: gold + goldEarned,
        dayStreak: nextDayStreak(dayStreak, lastPlayedDay, today),
        lastPlayedDay: today,
        ...nextQuestCounters(questData, won),
      }));
    }

    db.transact(ops);
  }, [userId, stats, leaderboardId, profileId, premium, gold, dayStreak, lastPlayedDay, questData]);

  const addGold = useCallback((amount: number) => {
    if (profileId) db.transact([tx.profiles[profileId].update({ gold: gold + amount })]);
  }, [profileId, gold]);

  const addLives = useCallback((amount: number) => {
    if (profileId) db.transact([tx.profiles[profileId].update({ lives: lives + amount })]);
  }, [profileId, lives]);

  const spendLife = useCallback((): boolean => {
    if (!profileId || lives <= 0) return false;
    db.transact([tx.profiles[profileId].update({ lives: lives - 1 })]);
    return true;
  }, [profileId, lives]);

  const levelInfo = useMemo(() => computeLevel(stats.points), [stats.points]);

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  const value = useMemo(
    () => ({
      stats, avatar, nickname, selectedTable, profileId, userId, winRate,
      gold, equippedAbility, abilitiesRaw, storyProgressRaw, lives, questData,
      lastXpGain, lastGoldGain, recordGame, addBonusXp, addGold, addLives, spendLife,
      level: levelInfo.level,
      levelProgress: levelInfo.progress,
      xpForNextLevel: levelInfo.xpForNext,
      xpInLevel: levelInfo.xpInLevel,
    }),
    [stats, avatar, nickname, selectedTable, profileId, userId, winRate, gold, equippedAbility, abilitiesRaw, storyProgressRaw, lives, questData, lastXpGain, lastGoldGain, recordGame, addBonusXp, addGold, addLives, spendLife, levelInfo],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlayerStats() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayerStats must be used within PlayerStatsProvider");
  return ctx;
}
