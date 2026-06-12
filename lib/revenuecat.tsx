import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
} from "react-native-purchases";
import { db } from "@/lib/instant";

// --- Entitlement keys (must match RevenueCat dashboard lookup_keys) ---
export const ENTITLEMENT = {
  PREMIUM: "premium",
  PACK_ANGEL: "pack_angel",
  PACK_DEMON: "pack_demon",
} as const;

// --- Product IDs (must match Play Console / App Store Connect) ---
export const PRODUCT_ID = {
  PREMIUM_LIFETIME: Platform.select({
    android: "flipia_premium_lifetime",
    ios: "com.rdh36.flipia.premium_lifetime",
  })!,
  PACK_ANGEL: Platform.select({
    android: "flipia_pack_angel",
    ios: "com.rdh36.flipia.pack_angel",
  })!,
  PACK_DEMON: Platform.select({
    android: "flipia_pack_demon",
    ios: "com.rdh36.flipia.pack_demon",
  })!,
} as const;

// Consumable hearts packs (story campaign retries) — same SKU on both stores.
export const HEARTS_PACKS = [
  { productId: "hearts_5", hearts: 5, fallbackPrice: "0,99 €" },
  { productId: "hearts_15", hearts: 15, fallbackPrice: "1,99 €" },
  { productId: "hearts_40", hearts: 40, fallbackPrice: "3,99 €" },
] as const;

// Permanent discounts baked into the Play Store prices — used to display
// the crossed-out "original" price next to the real RevenueCat price.
export const DISCOUNT = {
  HEARTS: 0.1,
  PREMIUM: 0.3,
} as const;

/**
 * Crossed-out pre-discount price, derived from the live store price
 * (price / (1 - discount)) and formatted in the product's currency.
 * Returns null while the offering (or the product) isn't loaded.
 */
export function originalPriceFor(
  offering: PurchasesOffering | null,
  productId: string,
  discount: number,
): string | null {
  const product = offering?.availablePackages.find(
    (p) => p.product.identifier === productId,
  )?.product;
  if (!product?.price || !product.currencyCode) return null;
  const original = product.price / (1 - discount);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: product.currencyCode,
    }).format(original);
  } catch {
    return `${original.toFixed(2)} ${product.currencyCode}`;
  }
}

const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;

interface RCContext {
  customerInfo: CustomerInfo | null;
  offering: PurchasesOffering | null;
  isReady: boolean;
  /** Force re-fetch of offerings — call from screens that need products. */
  refreshOfferings: () => Promise<void>;
}

const Ctx = createContext<RCContext>({
  customerInfo: null,
  offering: null,
  isReady: false,
  refreshOfferings: async () => {},
});

async function fetchOfferingsWithRetry(
  attempts = 3,
  baseDelayMs = 800,
): Promise<PurchasesOffering | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      const o = await Purchases.getOfferings();
      if (o.current) return o.current;
    } catch (e) {
      if (__DEV__) console.warn(`[RC] getOfferings attempt ${i + 1} failed:`, e);
    }
    if (i < attempts - 1) {
      await new Promise((r) => setTimeout(r, baseDelayMs * Math.pow(2, i)));
    }
  }
  return null;
}

export function RevenueCatProvider({ children }: { children: React.ReactNode }) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isReady, setIsReady] = useState(false);

  const { user } = db.useAuth();
  const userId = user?.id;

  const refreshOfferings = useCallback(async () => {
    const o = await fetchOfferingsWithRetry();
    if (o) setOffering(o);
  }, []);

  // Initialize SDK once
  useEffect(() => {
    const apiKey = Platform.OS === "ios" ? IOS_API_KEY : ANDROID_API_KEY;
    if (!apiKey) {
      // No key configured yet (dev before Play/App Store apps connected in RC)
      setIsReady(true);
      return;
    }

    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.WARN);
    Purchases.configure({ apiKey });

    Purchases.addCustomerInfoUpdateListener(setCustomerInfo);

    Purchases.getCustomerInfo()
      .then(setCustomerInfo)
      .catch(() => {})
      .finally(() => setIsReady(true));

    fetchOfferingsWithRetry().then((o) => {
      if (o) setOffering(o);
    });

    return () => {
      Purchases.removeCustomerInfoUpdateListener(setCustomerInfo);
    };
  }, []);

  // Identify user when InstantDB userId becomes available
  useEffect(() => {
    if (!isReady || !userId) return;
    Purchases.logIn(userId)
      .then(({ customerInfo }) => setCustomerInfo(customerInfo))
      .catch(() => {});
  }, [isReady, userId]);

  const value = useMemo(
    () => ({ customerInfo, offering, isReady, refreshOfferings }),
    [customerInfo, offering, isReady, refreshOfferings],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
    </Ctx.Provider>
  );
}

export function useRevenueCat() {
  return useContext(Ctx);
}

// --- Purchase helpers ---

/**
 * Purchase a product by its store identifier.
 * Prefers `purchasePackage` via the current offering (Play Billing v6+ resolves
 * the base plan / purchase option correctly). Falls back to a raw product
 * fetch only if the offering doesn't expose this product.
 */
export async function purchaseProduct(productId: string) {
  const offerings = await Purchases.getOfferings();
  const pkg = offerings.current?.availablePackages.find(
    (p) => p.product.identifier === productId,
  );
  if (pkg) {
    return Purchases.purchasePackage(pkg);
  }

  const products = await Purchases.getProducts([productId]);
  if (!products.length) {
    throw new Error(
      `Product not found: ${productId}. Vérifie qu'il est Active dans Play Console et que l'app est installée depuis le Play Store (Internal Testing).`,
    );
  }
  return Purchases.purchaseStoreProduct(products[0]);
}

export async function restorePurchases() {
  return Purchases.restorePurchases();
}
