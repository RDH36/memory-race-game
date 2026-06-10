// Period maths for daily / weekly quests: which period we're in, how long
// until the next reset, and how counters roll over when a period changes.
import { localDayIndex } from "@/lib/dailyStreak";

/** Monday-aligned week index (epoch day 0 = Thursday → +3 offset). */
export function weekIndex(dayIdx: number): number {
  return Math.floor((dayIdx + 3) / 7);
}

/** Milliseconds until the next local midnight. */
export function msUntilDailyReset(now = new Date()): number {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

/** Milliseconds until next Monday 00:00 local. */
export function msUntilWeeklyReset(now = new Date()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0 Sun … 6 Sat
  const daysUntilMon = ((8 - dow) % 7) || 7;
  d.setDate(d.getDate() + daysUntilMon);
  return d.getTime() - now.getTime();
}

/** Human reset label: "3j 5h" for long spans, "8h 24m" otherwise. */
export function formatResetTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 60000)); // minutes
  const days = Math.floor(total / (60 * 24));
  const hours = Math.floor((total % (60 * 24)) / 60);
  const mins = total % 60;
  if (days > 0) return `${days}j ${hours}h`;
  return `${hours}h ${mins}m`;
}

export interface QuestCounters {
  dailyPeriod: number;
  dailyGames: number;
  dailyWins: number;
  weeklyPeriod: number;
  weeklyGames: number;
  weeklyWins: number;
}

/**
 * Computes the profile patch for daily/weekly counters after a finished
 * match. Counters reset (and their claimed lists clear) when the period
 * rolls over. Returns a partial profile update.
 */
export function nextQuestCounters(
  prev: Partial<QuestCounters>,
  won: boolean,
  now = Date.now(),
): Record<string, number | string> {
  const today = localDayIndex(now);
  const week = weekIndex(today);
  const dailySame = prev.dailyPeriod === today;
  const weeklySame = prev.weeklyPeriod === week;

  const patch: Record<string, number | string> = {
    dailyPeriod: today,
    dailyGames: (dailySame ? prev.dailyGames ?? 0 : 0) + 1,
    dailyWins: (dailySame ? prev.dailyWins ?? 0 : 0) + (won ? 1 : 0),
    weeklyPeriod: week,
    weeklyGames: (weeklySame ? prev.weeklyGames ?? 0 : 0) + 1,
    weeklyWins: (weeklySame ? prev.weeklyWins ?? 0 : 0) + (won ? 1 : 0),
  };
  if (!dailySame) patch.claimedDaily = "[]";
  if (!weeklySame) patch.claimedWeekly = "[]";
  return patch;
}
