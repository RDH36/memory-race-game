import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

export const UPDATE_THROTTLE_KEY = "inapp_update_dismissed_date";

export type AppStoreInfo = {
  version: string;
  trackViewUrl: string;
};

export function getCurrentAppVersion(): string {
  return Constants.expoConfig?.version ?? "1.0.0";
}

export function compareVersions(a: string, b: string): -1 | 0 | 1 {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

export async function fetchAppStoreVersion(
  bundleId: string
): Promise<AppStoreInfo | null> {
  try {
    const url = `https://itunes.apple.com/lookup?bundleId=${encodeURIComponent(bundleId)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      resultCount: number;
      results: { version: string; trackViewUrl: string }[];
    };
    if (data.resultCount === 0 || !data.results[0]) return null;
    const { version, trackViewUrl } = data.results[0];
    return { version, trackViewUrl };
  } catch (e) {
    if (__DEV__) console.warn("[update] fetchAppStoreVersion failed", e);
    return null;
  }
}

export function getStoreUrl(bundleId: string): string {
  if (Platform.OS === "ios") {
    return `https://apps.apple.com/app/id?bundleId=${bundleId}`;
  }
  return `https://play.google.com/store/apps/details?id=${bundleId}`;
}

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function wasDismissedToday(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(UPDATE_THROTTLE_KEY);
    return stored === todayKey();
  } catch {
    return false;
  }
}

export async function markDismissedToday(): Promise<void> {
  try {
    await AsyncStorage.setItem(UPDATE_THROTTLE_KEY, todayKey());
  } catch {
    // best-effort, silent
  }
}

export type UpdateCheckResult =
  | { kind: "available"; storeVersion: string; storeUrl: string }
  | { kind: "upToDate"; currentVersion: string }
  | { kind: "error" }
  | { kind: "unsupported" };

function getBundleId(): string | null {
  const cfg = Constants.expoConfig;
  if (Platform.OS === "ios") return cfg?.ios?.bundleIdentifier ?? null;
  return cfg?.android?.package ?? null;
}

/**
 * Manual update check — bypasses the daily-dismissal throttle and the __DEV__
 * kill-switch. Used by the "Check for updates" button in settings.
 */
export async function checkForUpdate(): Promise<UpdateCheckResult> {
  const bundleId = getBundleId();
  if (!bundleId) return { kind: "unsupported" };
  const currentVersion = getCurrentAppVersion();

  if (Platform.OS === "ios") {
    const info = await fetchAppStoreVersion(bundleId);
    if (!info) return { kind: "error" };
    const cmp = compareVersions(info.version, currentVersion);
    if (cmp > 0) {
      return {
        kind: "available",
        storeVersion: info.version,
        storeUrl: info.trackViewUrl,
      };
    }
    return { kind: "upToDate", currentVersion };
  }

  if (Platform.OS === "android") {
    let lib: any = null;
    try {
      lib = require("sp-react-native-in-app-updates");
    } catch (e) {
      if (__DEV__) console.warn("[update] sp-react-native-in-app-updates not available", e);
    }
    if (!lib?.default) {
      // No Play Store check possible — fall back to itunes-style logic doesn't apply.
      // Return unsupported so the UI can offer "Open Play Store" as a manual fallback.
      return { kind: "unsupported" };
    }
    try {
      const inst = new lib.default(false);
      const res = await inst.checkNeedsUpdate({ curVersion: currentVersion });
      if (res?.shouldUpdate) {
        return {
          kind: "available",
          storeVersion: res.storeVersion ?? "?",
          storeUrl: getStoreUrl(bundleId),
        };
      }
      return { kind: "upToDate", currentVersion };
    } catch (e) {
      if (__DEV__) console.warn("[update] manual android check failed", e);
      return { kind: "error" };
    }
  }

  return { kind: "unsupported" };
}
