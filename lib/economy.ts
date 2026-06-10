// Per-game economy — XP and soft-currency ("or") payouts by difficulty.
// Spent on the Builds page to unlock and upgrade abilities.

export const XP_REWARDS: Record<string, { win: number; loss: number }> = {
  easy: { win: 15, loss: 5 },
  medium: { win: 25, loss: 5 },
  hard: { win: 40, loss: 5 },
};

export const GOLD_REWARDS: Record<string, { win: number; loss: number }> = {
  easy: { win: 12, loss: 4 },
  medium: { win: 20, loss: 6 },
  hard: { win: 32, loss: 8 },
};

// Flat coins premium players get every game (matches the free rewarded-ad bonus).
export const PREMIUM_GOLD_BONUS = 50;
