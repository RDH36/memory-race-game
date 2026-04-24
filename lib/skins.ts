import { useMemo } from "react";
import { ENTITLEMENT } from "@/lib/revenuecat";
import { useEntitlements } from "@/hooks/useEntitlements";

export type EntitlementKey =
  | typeof ENTITLEMENT.PREMIUM
  | typeof ENTITLEMENT.PACK_ANGEL
  | typeof ENTITLEMENT.PACK_DEMON;

export interface AvatarSkin {
  id: string;
  emoji: string;
  /** i18n key under `avatars.{nameKey}` */
  nameKey: string;
  /** Hue 0-360 used to derive pastel bg + halo color (HSL) */
  hue: number;
  /** If true, use a neutral warm grey bg instead of hue-based pastel */
  neutral?: boolean;
  requires: EntitlementKey | null;
}

export interface TableSkin {
  id: string;
  name: string;
  requires: EntitlementKey | null;
  /** 3-color preview: frame = table bg, back = card back, face = card face */
  preview: { frame: string; back: string; face: string };
}

// --- Avatar registry ---
export const AVATAR_SKINS: AvatarSkin[] = [
  { id: "🧠", emoji: "🧠", nameKey: "brain",     hue: 290, requires: null },
  { id: "🦊", emoji: "🦊", nameKey: "fox",       hue: 28,  requires: null },
  { id: "🐙", emoji: "🐙", nameKey: "octopus",   hue: 320, requires: null },
  { id: "🦉", emoji: "🦉", nameKey: "owl",       hue: 42,  requires: null },
  { id: "🐼", emoji: "🐼", nameKey: "panda",     hue: 0,   neutral: true, requires: null },
  { id: "🦁", emoji: "🦁", nameKey: "lion",      hue: 55,  requires: null },
  { id: "🐯", emoji: "🐯", nameKey: "tiger",     hue: 32,  requires: null },
  { id: "🦄", emoji: "🦄", nameKey: "unicorn",   hue: 290, requires: null },
  { id: "🐺", emoji: "🐺", nameKey: "wolf",      hue: 250, requires: null },
  { id: "🦅", emoji: "🦅", nameKey: "eagle",     hue: 220, requires: null },
  { id: "🐸", emoji: "🐸", nameKey: "frog",      hue: 130, requires: null },
  { id: "🦋", emoji: "🦋", nameKey: "butterfly", hue: 280, requires: null },
  { id: "🐝", emoji: "🐝", nameKey: "bee",       hue: 48,  requires: null },
  { id: "🦈", emoji: "🦈", nameKey: "shark",     hue: 200, requires: null },
  { id: "🐳", emoji: "🐳", nameKey: "whale",     hue: 215, requires: null },
  { id: "🦩", emoji: "🦩", nameKey: "flamingo",  hue: 350, requires: null },
  { id: "👑", emoji: "👑", nameKey: "crown",     hue: 48,  requires: ENTITLEMENT.PREMIUM },
  { id: "👼", emoji: "👼", nameKey: "angel",     hue: 200, requires: ENTITLEMENT.PACK_ANGEL },
  { id: "😈", emoji: "😈", nameKey: "demon",     hue: 0,   requires: ENTITLEMENT.PACK_DEMON },
];

// --- Table registry — 3-color previews matching design's frame + back + face ---
export const TABLE_SKINS: TableSkin[] = [
  { id: "classic", name: "Classic", requires: null,
    preview: { frame: "#FAF1F1", back: "#534AB7", face: "#B4A7E8" } },
  { id: "premium", name: "Imperial Damask", requires: ENTITLEMENT.PREMIUM,
    preview: { frame: "#2A060D", back: "#6B0F1A", face: "#8B1727" } },
  { id: "angel", name: "Ivory Temple", requires: ENTITLEMENT.PACK_ANGEL,
    preview: { frame: "#F8F5EC", back: "#B8A574", face: "#EDE4C8" } },
  { id: "demon", name: "Blood & Sulfur", requires: ENTITLEMENT.PACK_DEMON,
    preview: { frame: "#0F0303", back: "#3D0606", face: "#6B0A0A" } },
];

// Backwards-compat: array of free avatar emojis only
export const AVATARS: string[] = AVATAR_SKINS.filter((s) => !s.requires).map((s) => s.emoji);

// --- Unlock helpers ---
type Ents = ReturnType<typeof useEntitlements>;

export function isUnlocked(requires: EntitlementKey | null, ents: Ents): boolean {
  if (!requires) return true;
  if (requires === ENTITLEMENT.PREMIUM) return ents.premium;
  if (requires === ENTITLEMENT.PACK_ANGEL) return ents.angel;
  if (requires === ENTITLEMENT.PACK_DEMON) return ents.demon;
  return false;
}

export function useUnlockedAvatars() {
  const ents = useEntitlements();
  return useMemo(
    () => AVATAR_SKINS.map((s) => ({ ...s, unlocked: isUnlocked(s.requires, ents) })),
    [ents],
  );
}

export function useUnlockedTables() {
  const ents = useEntitlements();
  return useMemo(
    () => TABLE_SKINS.map((s) => ({ ...s, unlocked: isUnlocked(s.requires, ents) })),
    [ents],
  );
}

export function useIsAvatarUnlocked(avatarId: string): boolean {
  const ents = useEntitlements();
  const skin = AVATAR_SKINS.find((s) => s.id === avatarId);
  return isUnlocked(skin?.requires ?? null, ents);
}

/**
 * Royal plateau theme (V2 Damas Impérial — rouge + or).
 * Used by the in-game and preview royal renderers.
 */
export const ROYAL_THEME = {
  // frame
  frame: "#2A060D",
  frameAccent: "#4A0D18",
  ink: "#1A0509",
  // cards
  back: "#6B0F1A",
  face: "#8B1727",
  // gold
  gold: "#F4DA8A",
  goldBright: "#FBEAB2",
  goldDeep: "#8C6A1F",
  goldAntique: "#B8913D",
  // accents
  parchment: "#F8EFD0",
  // matched states
  matchedP1: "#A02537",
  matchedP1Border: "#F4DA8A",
  matchedP2: "#4A0D18",
  matchedP2Border: "#E8C76A",
} as const;

/**
 * Inferno plateau theme (V3 Sang & Soufre — rouge sang + accent soufre vert).
 * Used by the in-game and preview inferno renderers.
 */
export const INFERNO_THEME = {
  // frame
  frame: "#0F0303",
  frameAccent: "#2A0606",
  ink: "#030000",
  // cards
  back: "#3D0606",
  face: "#6B0A0A",
  // accents
  ember: "#DC2626",
  emberBright: "#F87171",
  emberDeep: "#7F1D1D",
  sulfur: "#BEF264",       // signature green/yellow accent
  hotCore: "#EAB308",
  ash: "#FCA5A5",
  // matched states
  matchedP1: "#B91C1C",
  matchedP1Border: "#F87171",
  matchedP2: "#2A0606",
  matchedP2Border: "#DC2626",
} as const;

/**
 * Heaven plateau theme (V2 Temple d'Ivoire — ivoire + or antique).
 */
export const HEAVEN_THEME = {
  // frame
  frame: "#F8F5EC",
  frameAccent: "#FFFFFF",
  ink: "#5C4A1E",
  cloud: "#F4EFDE",
  // cards
  back: "#B8A574",
  face: "#EDE4C8",
  // accents — gold antique
  halo: "#B8860B",
  haloBright: "#FEF3C7",
  haloDeep: "#7C5E14",
  gold: "#DAA520",
  goldBright: "#FFF3B0",
  goldDeep: "#8B6914",
  // matched states
  matchedP1: "#DAA520",
  matchedP1Border: "#FFF3B0",
  matchedP2: "#F4EFDE",
  matchedP2Border: "#DAA520",
} as const;

export type CardSkin = "classic" | "royal" | "inferno" | "heaven";

/**
 * Maps a TABLE_SKINS id to the rendering skin used by GameGrid + CardItem.
 */
export function getCardSkin(tableId: string | undefined): CardSkin {
  if (tableId === "premium") return "royal";
  if (tableId === "demon") return "inferno";
  if (tableId === "angel") return "heaven";
  return "classic";
}

/**
 * Full-screen background color for a given skin. Returns null for classic
 * (so caller can fall back to theme `colors.surface`).
 */
export function getSkinBgColor(skin: CardSkin): string | null {
  if (skin === "royal") return ROYAL_THEME.frame;
  if (skin === "inferno") return INFERNO_THEME.frame;
  if (skin === "heaven") return HEAVEN_THEME.frame;
  return null;
}

export type PackId = "premium" | "angel" | "demon";

export function entitlementToPackId(ent: EntitlementKey | null): PackId | null {
  if (ent === ENTITLEMENT.PREMIUM) return "premium";
  if (ent === ENTITLEMENT.PACK_ANGEL) return "angel";
  if (ent === ENTITLEMENT.PACK_DEMON) return "demon";
  return null;
}
