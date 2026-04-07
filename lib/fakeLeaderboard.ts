import { FAKE_NAMES, FAKE_AVATARS } from "./fakeNames";
import type { LeaderboardEntry } from "../components/leaderboard/LeaderboardRow";

/**
 * Deterministic bot entries shown alongside real players in the leaderboard,
 * so the board never feels empty (especially at launch). Bots are not tappable
 * and never written to the database.
 */

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type BotLeaderboardEntry = LeaderboardEntry & { isBot: true };

let cached: BotLeaderboardEntry[] | null = null;

export function generateBotLeaderboard(): BotLeaderboardEntry[] {
  if (cached) return cached;

  // Deduplicate: FAKE_NAMES has a few repeats — Set preserves insertion order.
  const names = Array.from(new Set(FAKE_NAMES));
  const rand = mulberry32(0xc0ffee);

  // Shuffle name order deterministically so XP rank doesn't mirror source list.
  const shuffled = [...names];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const total = shuffled.length;

  cached = shuffled.map((name, i) => {
    // Assign a target level per rank so XP and level stay coherent.
    // Modest ceiling (top bots ~level 4) so an active real player easily
    // climbs above them and occupies the top of the leaderboard.
    const rankRatio = i / total;
    const targetLevel = Math.max(1, Math.round(4 - rankRatio * 3));

    // Matches computeLevel() in LeaderboardRow: needed(N) = N * 75.
    // Cumulative XP to reach level L = 75 * L * (L - 1) / 2.
    const levelStart = (75 * targetLevel * (targetLevel - 1)) / 2;
    const levelSize = 75 * targetLevel;
    const xp = Math.floor(levelStart + rand() * levelSize);

    // ~18-28 XP per game on average.
    const avgPerGame = 18 + rand() * 10;
    const gamesPlayed = Math.max(1, Math.floor(xp / avgPerGame));

    // 40-60% win rate.
    const winRate = 0.4 + rand() * 0.2;
    const wins = Math.floor(gamesPlayed * winRate);

    const avatar = FAKE_AVATARS[Math.floor(rand() * FAKE_AVATARS.length)];

    return {
      id: `bot-${i}-${name}`,
      name,
      avatar,
      xp,
      wins,
      gamesPlayed,
      isBot: true,
    };
  });

  return cached;
}
