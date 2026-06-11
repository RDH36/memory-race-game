// Abilities registry + economy — mirrors lib/skins.ts.
//
// Each ability is tied to an avatar. "tornado" is the default ability:
// it is owned by everyone from the start (the universal in-game shuffle).
// The others are unlocked and upgraded with gold on the Builds page.
import { useCallback, useMemo } from "react";
import { db } from "@/lib/instant";
import { tx } from "@instantdb/react-native";
import { usePlayerStats } from "@/lib/playerStats";
import type { HueName } from "@/components/ui/theme";

export const DEFAULT_ABILITY_ID = "tornado";

export interface Ability {
  id: string;
  /** Glyph shown on the ability badge. */
  emoji: string;
  /** i18n key under `abilities.{nameKey}.{name,desc,story,timing}`. */
  nameKey: string;
  /** Linked avatar emoji id (from AVATAR_SKINS). */
  avatarId: string;
  /** Arcade hue used for the card accents. */
  hue: HueName;
  /** The default ability is free and owned by everyone. */
  default?: boolean;
  /** Gold cost to unlock (0 for the default ability). */
  baseCost: number;
  /** Highest reachable level. */
  maxLevel: number;
  /** Base gold cost of an upgrade — scaled by current level. */
  upgradeCost: number;
  /** Unlocked by completing a quest instead of spending gold. */
  questLocked?: boolean;
}

// --- Ability registry ---
// Upgrades cost double the unlock price (upgradeCost = 2 × baseCost).
// Tornado is free to unlock, so it gets a flat upgrade price.
export const ABILITIES: Ability[] = [
  { id: "tornado", emoji: "🌪️", nameKey: "tornado", avatarId: "🦊", hue: "blue",   default: true, baseCost: 0,   maxLevel: 3, upgradeCost: 600 },
  { id: "freeze",  emoji: "❄️", nameKey: "freeze",  avatarId: "🐳", hue: "blue",   baseCost: 800,  maxLevel: 3, upgradeCost: 1500 },
  { id: "reveal",  emoji: "👁️", nameKey: "reveal",  avatarId: "🦉", hue: "violet", baseCost: 1200, maxLevel: 3, upgradeCost: 2200, questLocked: true },
  { id: "swap",    emoji: "🪝", nameKey: "swap",    avatarId: "🐙", hue: "pink",   baseCost: 2600, maxLevel: 2, upgradeCost: 5200 },
  { id: "shield",  emoji: "🛡️", nameKey: "shield",  avatarId: "🦁", hue: "gold",   baseCost: 1500, maxLevel: 3, upgradeCost: 2800 },
];

export function getAbility(id: string): Ability | undefined {
  return ABILITIES.find((a) => a.id === id);
}

/** A random ability + level (1-2) for a CPU/bot opponent. */
export function randomBotAbility(): { id: string; level: number; emoji: string; nameKey: string } {
  const a = ABILITIES[Math.floor(Math.random() * ABILITIES.length)];
  const level = 1 + Math.floor(Math.random() * Math.min(2, a.maxLevel));
  return { id: a.id, level, emoji: a.emoji, nameKey: a.nameKey };
}

// --- In-game effect resolution -------------------------------------------
// Maps an ability id + level to the concrete parameters consumed by the
// local game loop (see hooks/useLocalGame.ts + lib/powerEffects.ts).

export type AbilityEffectKind = "shuffle" | "reveal" | "freeze" | "steal" | "shield";

export interface AbilityEffect {
  kind: AbilityEffectKind;
  /** Times the power can be activated per game. */
  uses: number;
  /** Keep the turn after activation (utility powers don't end the turn). */
  keepTurn: boolean;
  /** reveal: number of cards flipped face-up + how long. */
  revealCount: number;
  revealMs: number;
  /** freeze: opponent turns skipped per activation. */
  freezeTurns: number;
  /** shield: mismatch protections granted per activation. */
  shieldCharges: number;
  /** steal: pairs taken from the opponent per activation. */
  stealCount: number;
}

const BASE: AbilityEffect = {
  kind: "shuffle",
  uses: 1,
  keepTurn: false,
  revealCount: 0,
  revealMs: 0,
  freezeTurns: 0,
  shieldCharges: 0,
  stealCount: 0,
};

export function abilityEffect(id: string, level: number): AbilityEffect {
  const lvl = Math.max(1, level);
  switch (id) {
    case "reveal":
      return { ...BASE, kind: "reveal", uses: 1, keepTurn: true,
        revealCount: lvl >= 2 ? 4 : 2, revealMs: lvl >= 3 ? 2600 : 1500 };
    case "freeze":
      return { ...BASE, kind: "freeze", uses: 1, keepTurn: true, freezeTurns: lvl };
    case "swap":
      // "Steal" — snatch whole pairs already found by the opponent.
      return { ...BASE, kind: "steal", uses: 1, keepTurn: true, stealCount: Math.min(lvl, 2) };
    case "shield":
      return { ...BASE, kind: "shield", uses: 1, keepTurn: true, shieldCharges: lvl };
    case "tornado":
    default:
      return { ...BASE, kind: "shuffle", uses: lvl >= 3 ? 2 : 1, keepTurn: lvl >= 2 };
  }
}

/** Count shown on cast banners ("Bouclier ×2"): shield charges, frozen
 *  turns, stolen pairs or revealed cards. Null when nothing to count. */
export function effectMagnitude(effect: AbilityEffect): number | null {
  switch (effect.kind) {
    case "shield": return effect.shieldCharges;
    case "freeze": return effect.freezeTurns;
    case "steal": return effect.stealCount;
    case "reveal": return effect.revealCount;
    default: return null;
  }
}

/** " ×2" banner suffix for an ability at a given level — empty below 2. */
export function magnitudeSuffix(id: string, level: number): string {
  const n = effectMagnitude(abilityEffect(id, level));
  return n && n >= 2 ? ` ×${n}` : "";
}

// --- Owned map helpers (JSON map of id -> level, stored on the profile) ---
type OwnedMap = Record<string, number>;

/** The default ability is always owned at level 1. */
function withDefault(map: OwnedMap): OwnedMap {
  return { [DEFAULT_ABILITY_ID]: 1, ...map };
}

export function parseOwned(raw: string | undefined | null): OwnedMap {
  if (!raw) return withDefault({});
  try {
    const parsed = JSON.parse(raw);
    return withDefault(typeof parsed === "object" && parsed ? parsed : {});
  } catch {
    return withDefault({});
  }
}

export function serializeOwned(map: OwnedMap): string {
  return JSON.stringify(map);
}

export function isOwned(owned: OwnedMap, id: string): boolean {
  return id === DEFAULT_ABILITY_ID || (owned[id] ?? 0) > 0;
}

export function getLevel(owned: OwnedMap, id: string): number {
  return owned[id] ?? (id === DEFAULT_ABILITY_ID ? 1 : 0);
}

/** Gold needed to go from `level` to `level + 1`. */
export function upgradeCostFor(ability: Ability, level: number): number {
  return ability.upgradeCost * level;
}

export interface AbilityState extends Ability {
  owned: boolean;
  equipped: boolean;
  level: number;
  /** Cost of the next upgrade, or null when maxed. */
  nextUpgradeCost: number | null;
}

/**
 * Reads the player's ability state and exposes unlock / upgrade / equip
 * mutations. Each mutation is a single atomic profile transaction (gold +
 * owned map / equipped id live on the same entity).
 */
export function usePlayerAbilities() {
  const { profileId, gold, equippedAbility, abilitiesRaw } = usePlayerStats();
  const owned = useMemo(() => parseOwned(abilitiesRaw), [abilitiesRaw]);
  const equipped = equippedAbility || DEFAULT_ABILITY_ID;

  const states: AbilityState[] = useMemo(
    () =>
      ABILITIES.map((a) => {
        const level = getLevel(owned, a.id);
        const isMax = level >= a.maxLevel;
        return {
          ...a,
          owned: isOwned(owned, a.id),
          equipped: equipped === a.id,
          level,
          nextUpgradeCost: !isOwned(owned, a.id) || isMax ? null : upgradeCostFor(a, level),
        };
      }),
    [owned, equipped],
  );

  const unlock = useCallback(
    (ability: Ability): boolean => {
      if (ability.questLocked) return false; // unlocked via quest, not gold
      if (!profileId || isOwned(owned, ability.id) || gold < ability.baseCost) return false;
      const next = serializeOwned({ ...owned, [ability.id]: 1 });
      db.transact(tx.profiles[profileId].update({ gold: gold - ability.baseCost, abilities: next }));
      return true;
    },
    [profileId, gold, owned],
  );

  const upgrade = useCallback(
    (ability: Ability): boolean => {
      const level = getLevel(owned, ability.id);
      if (!profileId || level <= 0 || level >= ability.maxLevel) return false;
      const cost = upgradeCostFor(ability, level);
      if (gold < cost) return false;
      const next = serializeOwned({ ...owned, [ability.id]: level + 1 });
      db.transact(tx.profiles[profileId].update({ gold: gold - cost, abilities: next }));
      return true;
    },
    [profileId, gold, owned],
  );

  const equip = useCallback(
    (ability: Ability): boolean => {
      if (!profileId || !isOwned(owned, ability.id) || equipped === ability.id) return false;
      db.transact(tx.profiles[profileId].update({ equippedAbility: ability.id }));
      return true;
    },
    [profileId, owned, equipped],
  );

  return { states, owned, equipped, gold, unlock, upgrade, equip };
}
