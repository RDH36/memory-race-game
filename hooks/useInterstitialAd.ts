import mobileAds, {
  InterstitialAd,
  AdEventType,
} from "react-native-google-mobile-ads";

const TEST_AD_UNIT_ID = "ca-app-pub-3940256099942544/1033173712";

const AD_UNIT_ID = __DEV__
  ? TEST_AD_UNIT_ID
  : process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID ?? TEST_AD_UNIT_ID;

let interstitial: InterstitialAd | null = null;
let isAdLoaded = false;

function createAndLoadAd() {
  interstitial = InterstitialAd.createForAdRequest(AD_UNIT_ID);

  interstitial.addAdEventListener(AdEventType.LOADED, () => {

    isAdLoaded = true;
  });

  interstitial.addAdEventListener(AdEventType.ERROR, (error) => {

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
  .catch((err) => {

  });

/**
 * Show interstitial ad then call onComplete.
 * If no ad is loaded, calls onComplete immediately (no blocking).
 * After ad closes, preloads the next one.
 */
export function showInterstitialThen(onComplete: () => void) {
  if (!isAdLoaded || !interstitial) {

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
