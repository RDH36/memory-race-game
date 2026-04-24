import { useCallback, useEffect, useRef, useState } from "react";
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from "react-native-google-mobile-ads";
import { usePremium } from "./useEntitlements";

const TEST_AD_UNIT_ID = "ca-app-pub-3940256099942544/5224354917";

const AD_UNIT_ID = __DEV__
  ? TEST_AD_UNIT_ID
  : process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID ?? TEST_AD_UNIT_ID;

const NOOP = () => {};

export function useRewardedAd(onRewardEarned: () => void) {
  const premium = usePremium();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const rewardedRef = useRef<RewardedAd | null>(null);
  const onRewardRef = useRef(onRewardEarned);
  onRewardRef.current = onRewardEarned;

  const loadAd = useCallback(() => {
    const rewarded = RewardedAd.createForAdRequest(AD_UNIT_ID);

    const unsubLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setIsLoaded(true);
    });

    const unsubEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        onRewardRef.current();
      },
    );

    const unsubClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      setIsShowing(false);
      setIsLoaded(false);
      unsubLoaded();
      unsubEarned();
      unsubClosed();
      unsubError();
      loadAd();
    });

    const unsubError = rewarded.addAdEventListener(AdEventType.ERROR, () => {
      setIsLoaded(false);
    });

    rewardedRef.current = rewarded;
    rewarded.load();
  }, []);

  useEffect(() => {
    if (premium) return;
    loadAd();
  }, [loadAd, premium]);

  const showAd = useCallback(() => {
    if (rewardedRef.current && isLoaded) {
      setIsShowing(true);
      rewardedRef.current.show();
    }
  }, [isLoaded]);

  if (premium) {
    return { isLoaded: false, isShowing: false, showAd: NOOP };
  }

  return { isLoaded, isShowing, showAd };
}
