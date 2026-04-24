import { useMemo } from "react";
import { ENTITLEMENT, useRevenueCat } from "@/lib/revenuecat";

export type PackKey = "angel" | "demon";

export function useEntitlements() {
  const { customerInfo, isReady } = useRevenueCat();
  const active = customerInfo?.entitlements.active ?? {};
  return {
    isLoading: !isReady,
    premium: ENTITLEMENT.PREMIUM in active,
    angel: ENTITLEMENT.PACK_ANGEL in active,
    demon: ENTITLEMENT.PACK_DEMON in active,
  };
}

export function usePremium(): boolean {
  return useEntitlements().premium;
}

export function useOwnedPacks(): PackKey[] {
  const { angel, demon } = useEntitlements();
  return useMemo(() => {
    const packs: PackKey[] = [];
    if (angel) packs.push("angel");
    if (demon) packs.push("demon");
    return packs;
  }, [angel, demon]);
}

/**
 * XP boost multiplier — 1.1 if premium, 1.0 otherwise.
 * Pass to recordGame({ xpBoost }) in playerStats.
 */
export function useXpBoost(): number {
  return usePremium() ? 1.1 : 1;
}
