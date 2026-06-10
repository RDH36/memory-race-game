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

/** The claimed-id list for `type`, scoped to the current period. */
function claimedFor(type: QuestType, q: QuestProfile): {
  raw: string | undefined;
  field: string;
  ids: string[];
} {
  if (type === "daily") {
    return { raw: q.claimedDailyRaw, field: "claimedDaily", ids: parseIds(q.claimedDailyRaw) };
  }
  if (type === "weekly") {
    return { raw: q.claimedWeeklyRaw, field: "claimedWeekly", ids: parseIds(q.claimedWeeklyRaw) };
  }
  return { raw: q.claimedQuestsRaw, field: "claimedQuests", ids: parseIds(q.claimedQuestsRaw) };
}

export function useQuests() {
  const { stats, level, questData, gold, profileId, abilitiesRaw } = usePlayerStats();

  const owned = useMemo(() => parseOwned(abilitiesRaw), [abilitiesRaw]);

  const ctx: QuestContext = useMemo(() => {
    const today = localDayIndex();
    const week = weekIndex(today);
    const dailyLive = questData.dailyPeriod === today;
    const weeklyLive = questData.weeklyPeriod === week;
    return {
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
    };
  }, [stats, level, questData]);

  const states: QuestState[] = useMemo(
    () =>
      QUESTS.map((def) => {
        const value = def.current(ctx);
        const met = value >= def.target;
        const { ids } = claimedFor(def.type, questData);
        const claimed = ids.includes(def.id);
        return { ...def, value, met, claimed, claimable: met && !claimed };
      }),
    [ctx, questData],
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
      const { field, ids } = claimedFor(def.type, questData);
      if (ids.includes(id)) return false;
      const update: Record<string, unknown> = { [field]: JSON.stringify([...ids, id]) };
      applyReward(def.reward, update);
      db.transact(tx.profiles[profileId].update(update));
      return true;
    },
    [profileId, ctx, questData, applyReward],
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
