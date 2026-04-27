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
  } catch {
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
