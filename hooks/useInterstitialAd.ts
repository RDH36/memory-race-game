import AsyncStorage from "@react-native-async-storage/async-storage";
import mobileAds, {
  InterstitialAd,
  AdEventType,
} from "react-native-google-mobile-ads";

const TEST_AD_UNIT_ID = "ca-app-pub-3940256099942544/1033173712";

const AD_UNIT_ID = __DEV__
  ? TEST_AD_UNIT_ID
  : process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID ?? TEST_AD_UNIT_ID;

const GAMES_PER_AD = 3;
const STORAGE_KEY = "interstitial_game_count";

let interstitial: InterstitialAd | null = null;
let isAdLoaded = false;
let gameCount = 0;

// Restore counter from storage
AsyncStorage.getItem(STORAGE_KEY).then((val) => {
  gameCount = val ? parseInt(val, 10) || 0 : 0;
});

function createAndLoadAd() {
  interstitial = InterstitialAd.createForAdRequest(AD_UNIT_ID);

  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    isAdLoaded = true;
  });

  interstitial.addAdEventListener(AdEventType.ERROR, () => {
    isAdLoaded = false;
  });

  interstitial.load();
}

// Initialize SDK then preload first ad
mobileAds()
  .initialize()
  .then(() => {
    createAndLoadAd();
  })
  .catch(() => {});

/**
 * Show interstitial ad after a game ends, limited to 1 ad per 3 games.
 * If no ad is loaded, limit not reached, or `skip` is true (e.g. premium user),
 * calls onComplete immediately. After ad closes, preloads the next one.
 */
export function showInterstitialThen(
  onComplete: () => void,
  options?: { skip?: boolean },
) {
  if (options?.skip) {
    onComplete();
    return;
  }

  gameCount++;
  AsyncStorage.setItem(STORAGE_KEY, gameCount.toString());

  if (gameCount % GAMES_PER_AD !== 0 || !isAdLoaded || !interstitial) {
    onComplete();
    return;
  }

  const unsubClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    unsubClosed();
    isAdLoaded = false;
    createAndLoadAd();
    onComplete();
  });

  interstitial.show();
  isAdLoaded = false;
}
