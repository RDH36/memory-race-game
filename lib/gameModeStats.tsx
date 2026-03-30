import { useMemo } from "react";
import { db } from "@/lib/instant";

interface ModeStats {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
}

export interface GameModeStats {
  global: ModeStats;
  aiEasy: ModeStats;
  aiMedium: ModeStats;
  aiHard: ModeStats;
  friends: ModeStats;
}

function computeMode(games: any[], filter: (g: any) => boolean, userId: string): ModeStats {
  const filtered = games.filter(filter);
  const gamesPlayed = filtered.length;
  const gamesWon = filtered.filter((g) => g.winnerId === userId).length;
  return {
    gamesPlayed,
    gamesWon,
    winRate: gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0,
  };
}

export function useGameModeStats(userId: string | undefined): GameModeStats | null {
  const { data } = db.useQuery(
    userId
      ? { games: { $: { where: { player1Id: userId }, order: { createdAt: "desc" } } } }
      : null,
  );

  return useMemo(() => {
    if (!userId || !data?.games) return null;
    const games = data.games;

    const global = computeMode(games, () => true, userId);
    const aiEasy = computeMode(games, (g) => g.player2Type === "cpu" && g.difficulty === "easy", userId);
    const aiMedium = computeMode(games, (g) => g.player2Type === "cpu" && g.difficulty === "medium", userId);
    const aiHard = computeMode(games, (g) => g.player2Type === "cpu" && g.difficulty === "hard", userId);
    const friends = computeMode(games, (g) => g.player2Type === "human", userId);

    return { global, aiEasy, aiMedium, aiHard, friends };
  }, [data?.games, userId]);
}
