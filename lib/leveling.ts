// Leveling curve — XP needed per level grows linearly (level * 75).
// Returns the current level plus progress toward the next one.
export function computeLevel(xp: number) {
  let level = 1;
  let total = 0;
  while (true) {
    const needed = level * 75;
    if (xp < total + needed) {
      return { level, xpInLevel: xp - total, xpForNext: needed, progress: (xp - total) / needed };
    }
    total += needed;
    level++;
  }
}
