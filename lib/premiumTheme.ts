import { ENTITLEMENT } from "./revenuecat";
import { getAvatarSkin, type EntitlementKey } from "./skins";

export interface PremiumTheme {
  /** 2-stop gradient used for the tile border ring */
  borderGradient: [string, string];
  /** Solid color used for the animated halo behind the tile */
  haloColor: string;
  /** Secondary tint used for outer halo falloff */
  haloAccent: string;
  /** Background of the corner badge */
  badgeBg: string;
  /** Foreground (icon tint) of the corner badge */
  badgeFg: string;
  /** Ionicons name for the badge glyph */
  badgeIcon: "star" | "sparkles" | "flame";
}

const PREMIUM_THEMES: Record<EntitlementKey, PremiumTheme> = {
  [ENTITLEMENT.PREMIUM]: {
    borderGradient: ["#FBEAB2", "#8C6A1F"],
    haloColor: "#F4DA8A",
    haloAccent: "#FBEAB2",
    badgeBg: "#F4DA8A",
    badgeFg: "#1A0509",
    badgeIcon: "star",
  },
  [ENTITLEMENT.PACK_ANGEL]: {
    borderGradient: ["#FFF3B0", "#B8860B"],
    haloColor: "#FFF3B0",
    haloAccent: "#DAA520",
    badgeBg: "#FFF3B0",
    badgeFg: "#5C4A1E",
    badgeIcon: "sparkles",
  },
  [ENTITLEMENT.PACK_DEMON]: {
    borderGradient: ["#991B1B", "#0A0000"],
    haloColor: "#7F1D1D",
    haloAccent: "#1A0000",
    badgeBg: "#0A0000",
    badgeFg: "#DC2626",
    badgeIcon: "flame",
  },
};

export function getPremiumTheme(requires: EntitlementKey | null): PremiumTheme | null {
  if (!requires) return null;
  return PREMIUM_THEMES[requires] ?? null;
}

export function getPremiumThemeForEmoji(emoji: string): PremiumTheme | null {
  const skin = getAvatarSkin(emoji);
  return getPremiumTheme(skin?.requires ?? null);
}
