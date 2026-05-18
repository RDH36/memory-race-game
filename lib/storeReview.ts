import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";
import * as StoreReview from "expo-store-review";

const LAST_PROMPTED_KEY = "review_last_prompted_at";
const MIN_GAMES_WON = 3;
const MIN_DAYS_BETWEEN_PROMPTS = 60;
const MIN_DAYS_MS = MIN_DAYS_BETWEEN_PROMPTS * 24 * 60 * 60 * 1000;

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.rdh36.flipia";

interface MaybeRequestReviewArgs {
  won: boolean;
  gamesWon: number;
}

export async function maybeRequestReview({ won, gamesWon }: MaybeRequestReviewArgs): Promise<void> {
  if (!won || gamesWon < MIN_GAMES_WON) return;

  try {
    const lastRaw = await AsyncStorage.getItem(LAST_PROMPTED_KEY);
    if (lastRaw) {
      const last = parseInt(lastRaw, 10);
      if (Number.isFinite(last) && Date.now() - last < MIN_DAYS_MS) return;
    }

    if (!(await StoreReview.isAvailableAsync())) return;
    if (!(await StoreReview.hasAction())) return;

    await StoreReview.requestReview();
    await AsyncStorage.setItem(LAST_PROMPTED_KEY, String(Date.now()));
  } catch {
    // Silent fail — never crash for a review prompt
  }
}

export async function openStoreReview(): Promise<void> {
  try {
    if (await StoreReview.isAvailableAsync()) {
      if (await StoreReview.hasAction()) {
        await StoreReview.requestReview();
        return;
      }
    }
  } catch {}
  Linking.openURL(PLAY_STORE_URL).catch(() => {});
}
