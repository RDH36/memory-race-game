// Shared shapes for the player stats context (lib/playerStats.tsx).

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  points: number;
}

export interface GameData {
  scoreP1: number;
  scoreP2: number;
  duration: number;
  player2Type?: "cpu" | "human";
}

export interface RecordGameOptions {
  xpBoost?: number;
}

export const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0, gamesWon: 0, currentStreak: 0, bestStreak: 0, points: 0,
};
