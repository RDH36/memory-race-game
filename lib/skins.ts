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
  { id: "premium", name: "Royal", requires: ENTITLEMENT.PREMIUM,
    preview: { frame: "#1A1A2E", back: "#FFD366", face: "#4A3F6B" } },
  { id: "angel", name: "Heaven", requires: ENTITLEMENT.PACK_ANGEL,
    preview: { frame: "#EAF5FF", back: "#3B82F6", face: "#A0CCFF" } },
  { id: "demon", name: "Inferno", requires: ENTITLEMENT.PACK_DEMON,
    preview: { frame: "#2D0F0F", back: "#F97316", face: "#A02408" } },
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

export type PackId = "premium" | "angel" | "demon";

export function entitlementToPackId(ent: EntitlementKey | null): PackId | null {
  if (ent === ENTITLEMENT.PREMIUM) return "premium";
  if (ent === ENTITLEMENT.PACK_ANGEL) return "angel";
  if (ent === ENTITLEMENT.PACK_DEMON) return "demon";
  return null;
}
