import { createContext, useContext, useEffect, useState } from "react";
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

const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;

interface RCContext {
  customerInfo: CustomerInfo | null;
  offering: PurchasesOffering | null;
  isReady: boolean;
}

const Ctx = createContext<RCContext>({
  customerInfo: null,
  offering: null,
  isReady: false,
});

export function RevenueCatProvider({ children }: { children: React.ReactNode }) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isReady, setIsReady] = useState(false);

  const { user } = db.useAuth();
  const userId = user?.id;

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

    Purchases.getOfferings()
      .then((o) => setOffering(o.current))
      .catch(() => {});

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

  return (
    <Ctx.Provider value={{ customerInfo, offering, isReady }}>
      {children}
    </Ctx.Provider>
  );
}

export function useRevenueCat() {
  return useContext(Ctx);
}

// --- Purchase helpers ---

export async function purchaseProduct(productId: string) {
  const products = await Purchases.getProducts([productId]);
  if (!products.length) throw new Error(`Product not found: ${productId}`);
  return Purchases.purchaseStoreProduct(products[0]);
}

export async function restorePurchases() {
  return Purchases.restorePurchases();
}
