// Daily-streak math — pure helpers used by the player-stats provider to
// track how many consecutive calendar days a player has finished a match.

/** Days elapsed since the epoch in the device's local timezone. */
export function localDayIndex(now = Date.now()): number {
  const d = new Date(now);
  return Math.floor((now - d.getTimezoneOffset() * 60000) / 86400000);
}

/**
 * Updates the consecutive-day streak after a finished match.
 * Same day → unchanged; previous day → +1; any gap → reset to 1.
 */
export function nextDayStreak(
  prevStreak: number,
  lastDay: number | undefined,
  today: number,
): number {
  if (lastDay === today) return Math.max(1, prevStreak);
  if (lastDay === today - 1) return prevStreak + 1;
  return 1;
}
