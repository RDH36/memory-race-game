import type { HueName } from "@/components/ui/theme";
import type { PlayerStats } from "./playerStats";

// Quest catalog — daily, weekly and "hauts faits" (lifetime achievements).
// Every quest is goal-based: a progress value (current) toward a target, so
// the UI can draw a progress bar. Met = current >= target.

export type QuestType = "daily" | "weekly" | "achievement";

/** Raw quest-related profile fields, consumed by the quests hook. */
export interface QuestProfile {
  claimedQuestsRaw: string | undefined;
  dayStreak: number;
  dailyPeriod: number | undefined;
  dailyGames: number;
  dailyWins: number;
  claimedDailyRaw: string | undefined;
  weeklyPeriod: number | undefined;
  weeklyGames: number;
  weeklyWins: number;
  claimedWeeklyRaw: string | undefined;
}

export type QuestReward =
  | { kind: "gold"; amount: number }
  | { kind: "ability"; abilityId: string; emoji: string };

/** Per-period counters resolved for the active day / week. */
export interface QuestContext {
  stats: PlayerStats;
  level: number;
  dayStreak: number;
  daily: { games: number; wins: number };
  weekly: { games: number; wins: number };
}

export interface QuestDef {
  id: string;
  type: QuestType;
  emoji: string;
  hue: HueName;
  reward: QuestReward;
  target: number;
  /** Current progress value for this quest in the given context. */
  current: (ctx: QuestContext) => number;
}

const gold = (amount: number): QuestReward => ({ kind: "gold", amount });

export const QUESTS: QuestDef[] = [
  // --- Quotidien (reset chaque jour) ---
  { id: "daily-play-3", type: "daily", emoji: "🎮", hue: "blue", reward: gold(40), target: 3, current: (c) => c.daily.games },
  { id: "daily-win-1", type: "daily", emoji: "🥇", hue: "gold", reward: gold(30), target: 1, current: (c) => c.daily.wins },
  { id: "daily-win-3", type: "daily", emoji: "🔥", hue: "coral", reward: gold(70), target: 3, current: (c) => c.daily.wins },

  // --- Hebdo (reset chaque semaine) ---
  { id: "weekly-play-15", type: "weekly", emoji: "🎯", hue: "blue", reward: gold(160), target: 15, current: (c) => c.weekly.games },
  { id: "weekly-win-7", type: "weekly", emoji: "🏆", hue: "gold", reward: gold(260), target: 7, current: (c) => c.weekly.wins },
  { id: "weekly-play-30", type: "weekly", emoji: "💯", hue: "violet", reward: gold(420), target: 30, current: (c) => c.weekly.games },

  // --- Hauts faits (à vie) ---
  { id: "daily-7", type: "achievement", emoji: "📅", hue: "pink", reward: { kind: "ability", abilityId: "reveal", emoji: "👁️" }, target: 7, current: (c) => c.dayStreak },
  { id: "first-win", type: "achievement", emoji: "🥇", hue: "gold", reward: gold(50), target: 1, current: (c) => c.stats.gamesWon },
  { id: "wins-10", type: "achievement", emoji: "🏆", hue: "gold", reward: gold(150), target: 10, current: (c) => c.stats.gamesWon },
  { id: "wins-50", type: "achievement", emoji: "👑", hue: "gold", reward: gold(400), target: 50, current: (c) => c.stats.gamesWon },
  { id: "wins-100", type: "achievement", emoji: "🏅", hue: "gold", reward: gold(800), target: 100, current: (c) => c.stats.gamesWon },
  { id: "ten-games", type: "achievement", emoji: "🎮", hue: "blue", reward: gold(50), target: 10, current: (c) => c.stats.gamesPlayed },
  { id: "games-50", type: "achievement", emoji: "🎯", hue: "blue", reward: gold(150), target: 50, current: (c) => c.stats.gamesPlayed },
  { id: "100-games", type: "achievement", emoji: "💯", hue: "blue", reward: gold(300), target: 100, current: (c) => c.stats.gamesPlayed },
  { id: "games-250", type: "achievement", emoji: "🎖️", hue: "blue", reward: gold(600), target: 250, current: (c) => c.stats.gamesPlayed },
  { id: "streak-3", type: "achievement", emoji: "🔥", hue: "coral", reward: gold(100), target: 3, current: (c) => c.stats.bestStreak },
  { id: "streak-5", type: "achievement", emoji: "⚡", hue: "coral", reward: gold(250), target: 5, current: (c) => c.stats.bestStreak },
  { id: "streak-10", type: "achievement", emoji: "🚀", hue: "coral", reward: gold(600), target: 10, current: (c) => c.stats.bestStreak },
  { id: "level-5", type: "achievement", emoji: "⭐", hue: "violet", reward: gold(100), target: 5, current: (c) => c.level },
  { id: "level-10", type: "achievement", emoji: "🌟", hue: "violet", reward: gold(250), target: 10, current: (c) => c.level },
  { id: "level-15", type: "achievement", emoji: "💫", hue: "violet", reward: gold(450), target: 15, current: (c) => c.level },
  { id: "level-20", type: "achievement", emoji: "🧙", hue: "violet", reward: gold(700), target: 20, current: (c) => c.level },
  { id: "level-25", type: "achievement", emoji: "👨‍🎓", hue: "violet", reward: gold(1000), target: 25, current: (c) => c.level },
  { id: "500-points", type: "achievement", emoji: "💎", hue: "green", reward: gold(150), target: 500, current: (c) => c.stats.points },
  { id: "points-1000", type: "achievement", emoji: "💰", hue: "green", reward: gold(350), target: 1000, current: (c) => c.stats.points },
  { id: "points-5000", type: "achievement", emoji: "🏦", hue: "green", reward: gold(900), target: 5000, current: (c) => c.stats.points },
];

export const QUEST_TYPES: QuestType[] = ["daily", "weekly", "achievement"];

/** The one-off quest featured above the tabs (unlocks the Reveal ability). */
export const FEATURED_QUEST_ID = "daily-7";

const EMOJI_BY_ID: Record<string, string> = QUESTS.reduce(
  (acc, q) => ({ ...acc, [q.id]: q.emoji }),
  {},
);

export function getQuestEmoji(id: string): string {
  return EMOJI_BY_ID[id] ?? "🏆";
}

export function questsByType(type: QuestType): QuestDef[] {
  return QUESTS.filter((q) => q.type === type);
}

export function isQuestMet(def: QuestDef, ctx: QuestContext): boolean {
  return def.current(ctx) >= def.target;
}

/** Ids of lifetime achievements whose condition is met (for celebrations). */
export function metAchievementIds(ctx: QuestContext): string[] {
  return QUESTS
    .filter((q) => q.type === "achievement" && isQuestMet(q, ctx))
    .map((q) => q.id);
}
