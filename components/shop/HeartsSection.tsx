// Hearts shop section — consumable packs that refill story-campaign lives.
// Purchase goes through RevenueCat; on success the hearts are credited to
// the profile in one transaction.
import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import { haptics } from "@/lib/haptics";
import { Btn3D, Panel, Ribbon } from "@/components/ui/arcade";
import { Label } from "@/components/ui/Label";
import { StrikePrice } from "@/components/shop/StrikePrice";
import { usePlayerStats } from "@/lib/playerStats";
import { usePremium } from "@/hooks/useEntitlements";
import { HEARTS_AD_UNIT_ID, useRewardedAd } from "@/hooks/useRewardedAd";
import { DISCOUNT, HEARTS_PACKS, originalPriceFor, purchaseProduct, useRevenueCat } from "@/lib/revenuecat";

const AD_CLAIM_KEY = "hearts_ad_last_claimed";
const AD_HEARTS = 3;

type Info = { icon: string; title: string; message: string };

export function HeartsSection({ onInfo }: { onInfo: (info: Info) => void }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { offering } = useRevenueCat();
  const { profileId, addLives } = usePlayerStats();
  const premium = usePremium();
  const [busyId, setBusyId] = useState<string | null>(null);

  // Free hearts via rewarded ad — limited to one claim per local day.
  const [adClaimedToday, setAdClaimedToday] = useState(true);
  useEffect(() => {
    AsyncStorage.getItem(AD_CLAIM_KEY).then((v) => {
      setAdClaimedToday(v === new Date().toDateString());
    });
  }, []);

  const onAdReward = useCallback(() => {
    addLives(AD_HEARTS);
    setAdClaimedToday(true);
    AsyncStorage.setItem(AD_CLAIM_KEY, new Date().toDateString());
    haptics.coin();
    onInfo({
      icon: "❤️",
      title: t("shop.hearts.successTitle"),
      message: t("shop.hearts.successText", { hearts: AD_HEARTS }),
    });
  }, [addLives, onInfo, t]);

  const { isLoaded: adLoaded, showAd } = useRewardedAd(onAdReward, HEARTS_AD_UNIT_ID);

  const priceFor = (productId: string, fallback: string) => {
    const pkg = offering?.availablePackages.find((p) => p.product.identifier === productId);
    return pkg?.product.priceString ?? fallback;
  };

  const handleBuy = async (productId: string, hearts: number) => {
    if (busyId || !profileId) return;
    try {
      setBusyId(productId);
      haptics.select();
      await purchaseProduct(productId);
      addLives(hearts);
      haptics.coin();
      onInfo({
        icon: "❤️",
        title: t("shop.hearts.successTitle"),
        message: t("shop.hearts.successText", { hearts }),
      });
    } catch (e: any) {
      if (!e?.userCancelled) {
        onInfo({ icon: "⚠️", title: t("common.error", "Erreur"), message: e?.message ?? "" });
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <Label text={t("shop.hearts.section")} style={{ marginBottom: 0 }} />
        <Ribbon color="coral">{t("shop.hearts.discount")}</Ribbon>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        {HEARTS_PACKS.map((pack) => {
          const original = originalPriceFor(offering, pack.productId, DISCOUNT.HEARTS);
          return (
            <Panel
              key={pack.productId}
              background={colors.surfaceContainer}
              style={{ flex: 1, padding: 12, alignItems: "center", gap: 6 }}
            >
              <Text style={{ fontSize: 30 }}>❤️</Text>
              <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 16, color: colors.onSurface }}>
                ×{pack.hearts}
              </Text>
              <StrikePrice value={original} color={colors.onSurfaceMuted} />
              <Btn3D
                color="coral"
                size="sm"
                full
                loading={busyId === pack.productId}
                label={priceFor(pack.productId, pack.fallbackPrice)}
                onPress={() => handleBuy(pack.productId, pack.hearts)}
              />
            </Panel>
          );
        })}
      </View>

      {/* Free daily hearts via rewarded ad (hidden for premium: no ads) */}
      {!premium && (
        <Panel
          background={colors.surfaceContainer}
          style={{
            marginTop: 10,
            padding: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 26 }}>🎬</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 14, color: colors.onSurface }}>
              {t("shop.hearts.adTitle", { hearts: AD_HEARTS })}
            </Text>
            <Text style={{ fontFamily: "Nunito_600SemiBold", fontSize: 11.5, color: colors.onSurfaceMuted }}>
              {adClaimedToday ? t("shop.hearts.adDone") : t("shop.hearts.adLimit")}
            </Text>
          </View>
          <Btn3D
            color="green"
            size="sm"
            disabled={adClaimedToday || !adLoaded}
            label={t("shop.hearts.adCta")}
            onPress={showAd}
          />
        </Panel>
      )}

      <Text
        style={{
          fontFamily: "Nunito_600SemiBold",
          fontSize: 11.5,
          color: colors.onSurfaceMuted,
          textAlign: "center",
          marginTop: 8,
        }}
      >
        {t("shop.hearts.hint")}
      </Text>
    </View>
  );
}
