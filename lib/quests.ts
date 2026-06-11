// Quests hook — resolves the active daily/weekly period, builds quest states
// (progress + claimable/claimed) and claims rewards atomically on the profile.
// Daily/weekly counters belonging to a past period are treated as zeroed so
// the UI is correct even before the player has finished a match this period.
import { useCallback, useEffect, useMemo } from "react";
import { AppState } from "react-native";
import { db } from "@/lib/instant";
import { tx } from "@instantdb/react-native";
import { usePlayerStats } from "@/lib/playerStats";
import { refreshQuestReminders } from "@/lib/notifications";
import { parseOwned, serializeOwned } from "@/lib/abilities";
import { localDayIndex } from "@/lib/dailyStreak";
import { weekIndex } from "@/lib/questPeriods";
import {
  FEATURED_QUEST_ID,
  QUESTS,
  dailyQuestsForDay,
  isQuestMet,
  type QuestContext,
  type QuestDef,
  type QuestProfile,
  type QuestReward,
  type QuestType,
} from "@/lib/questCatalog";

export interface QuestState extends QuestDef {
  current: QuestDef["current"];
  value: number;
  met: boolean;
  claimed: boolean;
  claimable: boolean;
}

function parseIds(raw: string | undefined | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

/**
 * The claimed-id list for `type`, scoped to the LIVE period: a daily/weekly
 * claimed list from a past period counts as empty (the quests have reset, so
 * they must show as fresh/unclaimed even before the first match this period).
 */
function claimedFor(
  type: QuestType,
  q: QuestProfile,
  dailyLive: boolean,
  weeklyLive: boolean,
): { field: string; ids: string[] } {
  if (type === "daily") {
    return { field: "claimedDaily", ids: dailyLive ? parseIds(q.claimedDailyRaw) : [] };
  }
  if (type === "weekly") {
    return { field: "claimedWeekly", ids: weeklyLive ? parseIds(q.claimedWeeklyRaw) : [] };
  }
  return { field: "claimedQuests", ids: parseIds(q.claimedQuestsRaw) };
}

export function useQuests() {
  const { stats, level, questData, gold, profileId, abilitiesRaw } = usePlayerStats();

  const owned = useMemo(() => parseOwned(abilitiesRaw), [abilitiesRaw]);

  // Which daily/weekly period is live right now (a past period = reset).
  const today = localDayIndex();
  const week = weekIndex(today);
  const dailyLive = questData.dailyPeriod === today;
  const weeklyLive = questData.weeklyPeriod === week;

  const ctx: QuestContext = useMemo(
    () => ({
      stats,
      level,
      dayStreak: questData.dayStreak,
      daily: {
        games: dailyLive ? questData.dailyGames : 0,
        wins: dailyLive ? questData.dailyWins : 0,
      },
      weekly: {
        games: weeklyLive ? questData.weeklyGames : 0,
        wins: weeklyLive ? questData.weeklyWins : 0,
      },
    }),
    [stats, level, questData, dailyLive, weeklyLive],
  );

  // Today's daily quests are a random subset of the pool (rotates each day).
  const dailyToday = useMemo(() => new Set(dailyQuestsForDay(today).map((q) => q.id)), [today]);

  const states: QuestState[] = useMemo(
    () =>
      QUESTS.filter((def) => def.type !== "daily" || dailyToday.has(def.id)).map((def) => {
        const value = def.current(ctx);
        const met = value >= def.target;
        const { ids } = claimedFor(def.type, questData, dailyLive, weeklyLive);
        const claimed = ids.includes(def.id);
        return { ...def, value, met, claimed, claimable: met && !claimed };
      }),
    [ctx, questData, dailyLive, weeklyLive, dailyToday],
  );

  const applyReward = useCallback(
    (reward: QuestReward, update: Record<string, unknown>) => {
      if (reward.kind === "gold") {
        update.gold = gold + reward.amount;
      } else {
        const cur = owned[reward.abilityId] ?? 0;
        update.abilities = serializeOwned({ ...owned, [reward.abilityId]: Math.max(1, cur) });
      }
    },
    [gold, owned],
  );

  const claim = useCallback(
    (id: string): boolean => {
      if (!profileId) return false;
      const def = QUESTS.find((q) => q.id === id);
      if (!def || !isQuestMet(def, ctx)) return false;
      const { field, ids } = claimedFor(def.type, questData, dailyLive, weeklyLive);
      if (ids.includes(id)) return false;
      const update: Record<string, unknown> = { [field]: JSON.stringify([...ids, id]) };
      applyReward(def.reward, update);
      db.transact(tx.profiles[profileId].update(update));
      return true;
    },
    [profileId, ctx, questData, applyReward, dailyLive, weeklyLive],
  );

  const claimableCount = (type: QuestType) =>
    states.filter((s) => s.type === type && s.claimable).length;

  const featured = states.find((s) => s.id === FEATURED_QUEST_ID);
  const totalClaimable = states.filter((s) => s.claimable).length;

  return { states, claim, claimableCount, featured, totalClaimable };
}

/**
 * Keeps the conditional quest reminders (7am daily / Friday 7am weekly) in
 * sync with progress: re-schedules on mount, whenever a period is fully
 * cleared, and each time the app returns to the foreground.
 */
export function useQuestReminders() {
  const { states } = useQuests();
  const dailyAllDone = states
    .filter((s) => s.type === "daily")
    .every((s) => s.claimed);
  const weeklyAllDone = states
    .filter((s) => s.type === "weekly")
    .every((s) => s.claimed);

  useEffect(() => {
    refreshQuestReminders({ dailyAllDone, weeklyAllDone });
    const sub = AppState.addEventListener("change", (status) => {
      if (status === "active") refreshQuestReminders({ dailyAllDone, weeklyAllDone });
    });
    return () => sub.remove();
  }, [dailyAllDone, weeklyAllDone]);
}
