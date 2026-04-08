import { useMemo } from "react";
import { db } from "@/lib/instant";

export interface MatchEntry {
  id: string;
  createdAt: number;
  difficulty: string;
  player2Type: "cpu" | "human";
  scoreP1: number;
  scoreP2: number;
  duration: number;
  won: boolean;
}

export function useMatchHistory(userId: string | undefined) {
  const { data, isLoading } = db.useQuery(
    userId
      ? { games: { $: { where: { player1Id: userId }, order: { createdAt: "desc" } } } }
      : null,
  );

  const matches: MatchEntry[] = useMemo(() => {
    if (!userId || !data?.games) return [];
    return data.games.map((g: any) => ({
      id: g.id,
      createdAt: g.createdAt,
      difficulty: g.difficulty,
      player2Type: g.player2Type,
      scoreP1: g.scoreP1,
      scoreP2: g.scoreP2,
      duration: g.duration,
      won: g.winnerId === userId,
    }));
  }, [data?.games, userId]);

  return { matches, isLoading };
}
