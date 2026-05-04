import type { PlayerStats } from "./playerStats";

export type AchievementId =
  | "first-win"
  | "ten-games"
  | "wins-10"
  | "games-50"
  | "streak-3"
  | "wins-50"
  | "100-games"
  | "level-5"
  | "streak-5"
  | "winrate-50"
  | "500-points"
  | "games-250"
  | "level-10"
  | "wins-100"
  | "streak-10"
  | "points-1000"
  | "level-15"
  | "level-20"
  | "points-5000"
  | "level-25";

export interface AchievementDefinition {
  id: AchievementId;
  emoji: string;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  { id: "first-win", emoji: "🥇" },
  { id: "ten-games", emoji: "🎮" },
  { id: "wins-10", emoji: "🏆" },
  { id: "games-50", emoji: "🎯" },
  { id: "streak-3", emoji: "🔥" },
  { id: "wins-50", emoji: "👑" },
  { id: "100-games", emoji: "💯" },
  { id: "level-5", emoji: "⭐" },
  { id: "streak-5", emoji: "⚡" },
  { id: "winrate-50", emoji: "♟️" },
  { id: "500-points", emoji: "💎" },
  { id: "games-250", emoji: "🎖️" },
  { id: "level-10", emoji: "🌟" },
  { id: "wins-100", emoji: "🏅" },
  { id: "streak-10", emoji: "🚀" },
  { id: "points-1000", emoji: "💰" },
  { id: "level-15", emoji: "💫" },
  { id: "level-20", emoji: "🧙" },
  { id: "points-5000", emoji: "🏦" },
  { id: "level-25", emoji: "👨‍🎓" },
];

const EMOJI_BY_ID: Record<string, string> = ACHIEVEMENT_DEFINITIONS.reduce(
  (acc, def) => ({ ...acc, [def.id]: def.emoji }),
  {},
);

export function getAchievementEmoji(id: string): string {
  return EMOJI_BY_ID[id] ?? "🏆";
}

export function isAchievementUnlocked(
  id: AchievementId,
  stats: PlayerStats,
  level: number,
): boolean {
  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;
  switch (id) {
    case "first-win": return stats.gamesWon >= 1;
    case "ten-games": return stats.gamesPlayed >= 10;
    case "wins-10": return stats.gamesWon >= 10;
    case "games-50": return stats.gamesPlayed >= 50;
    case "streak-3": return stats.bestStreak >= 3;
    case "wins-50": return stats.gamesWon >= 50;
    case "100-games": return stats.gamesPlayed >= 100;
    case "level-5": return level >= 5;
    case "streak-5": return stats.bestStreak >= 5;
    case "winrate-50": return stats.gamesPlayed >= 20 && winRate >= 0.5;
    case "500-points": return stats.points >= 500;
    case "games-250": return stats.gamesPlayed >= 250;
    case "level-10": return level >= 10;
    case "wins-100": return stats.gamesWon >= 100;
    case "streak-10": return stats.bestStreak >= 10;
    case "points-1000": return stats.points >= 1000;
    case "level-15": return level >= 15;
    case "level-20": return level >= 20;
    case "points-5000": return stats.points >= 5000;
    case "level-25": return level >= 25;
  }
}

export function computeUnlockedAchievementIds(
  stats: PlayerStats,
  level: number,
): AchievementId[] {
  return ACHIEVEMENT_DEFINITIONS
    .filter((def) => isAchievementUnlocked(def.id, stats, level))
    .map((def) => def.id);
}
