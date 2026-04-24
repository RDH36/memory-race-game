import { PRODUCT_ID, ENTITLEMENT } from "@/lib/revenuecat";
import type { PackId } from "@/lib/skins";

/**
 * Visual + identity config for a feature row in the pack detail page.
 * Display strings (title/description) come from i18n at render time, looked up via:
 *   t(`packs.${packId}.features.${i18nKey}.title|description`)
 */
export type FeatureSpec =
  | { kind: "avatar"; emoji: string; i18nKey: string }
  | { kind: "table"; bg: string; accent: string; i18nKey: string }
  | { kind: "perk"; icon: string; i18nKey: string };

export interface PackMeta {
  id: PackId;
  emoji: string;
  productId: string;
  entitlement: string;
  fallbackPrice: string;
  /** Card / hero gradient — 2-stop, dark base → brand color */
  gradient: string[];
  gradientAngle: number;
  /** Solid CTA button background */
  cta: string;
  /** Text color on the CTA button */
  ctaText: string;
  /** Body text color over hero/card gradient */
  heroText: string;
  /** Color used on price chip text (sits on white pill) */
  chipText: string;
  /** Glow color for hero shadow */
  glow: string;
  /** Feature visual specs — title/description hydrated from i18n at render */
  features: FeatureSpec[];
}

export const PACKS: Record<PackId, PackMeta> = {
  premium: {
    id: "premium",
    emoji: "👑",
    productId: PRODUCT_ID.PREMIUM_LIFETIME,
    entitlement: ENTITLEMENT.PREMIUM,
    fallbackPrice: "9,99 €",
    gradient: ["#1E1B4B", "#7C3AED"],
    gradientAngle: 165,
    cta: "#FCC03B",
    ctaText: "#0F0814",
    heroText: "#FFFFFF",
    chipText: "#1E1B4B",
    glow: "#FCC03B",
    features: [
      { kind: "perk", icon: "🚫", i18nKey: "noAds" },
      { kind: "perk", icon: "⚡", i18nKey: "xpBoost" },
      { kind: "avatar", emoji: "👑", i18nKey: "avatar" },
      { kind: "table", bg: "#1A1A2E", accent: "#FCC03B", i18nKey: "table" },
    ],
  },
  angel: {
    id: "angel",
    emoji: "👼",
    productId: PRODUCT_ID.PACK_ANGEL,
    entitlement: ENTITLEMENT.PACK_ANGEL,
    fallbackPrice: "2,99 €",
    gradient: ["#0C1E5C", "#3B82F6"],
    gradientAngle: 165,
    cta: "#0C1E5C",
    ctaText: "#FFFFFF",
    heroText: "#FFFFFF",
    chipText: "#0C1E5C",
    glow: "#60A5FA",
    features: [
      { kind: "avatar", emoji: "👼", i18nKey: "avatar" },
      { kind: "table", bg: "#EAF5FF", accent: "#3B82F6", i18nKey: "table" },
    ],
  },
  demon: {
    id: "demon",
    emoji: "😈",
    productId: PRODUCT_ID.PACK_DEMON,
    entitlement: ENTITLEMENT.PACK_DEMON,
    fallbackPrice: "2,99 €",
    gradient: ["#1A0000", "#DC2626"],
    gradientAngle: 165,
    cta: "#F97316",
    ctaText: "#FFFFFF",
    heroText: "#FFFFFF",
    chipText: "#1A0000",
    glow: "#F97316",
    features: [
      { kind: "avatar", emoji: "😈", i18nKey: "avatar" },
      { kind: "table", bg: "#2D0F0F", accent: "#F97316", i18nKey: "table" },
    ],
  },
};
