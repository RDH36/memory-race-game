import { useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";
import { haptics } from "@/lib/haptics";
import { IconBtn } from "@/components/ui/arcade";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { Label } from "../../components/ui/Label";
import { useEntitlements } from "../../hooks/useEntitlements";
import { useRevenueCat, restorePurchases, originalPriceFor, DISCOUNT, PRODUCT_ID } from "../../lib/revenuecat";
import { PACKS } from "../../lib/packs";
import { PremiumHero } from "../../components/shop/PremiumHero";
import { PackCard } from "../../components/shop/PackCard";
import { HeartsSection } from "../../components/shop/HeartsSection";
import { useCoachMark } from "@/components/onboarding/CoachBubble";
import { SpotlightCoach } from "@/components/onboarding/SpotlightCoach";

export default function ShopScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { offering, isReady } = useRevenueCat();
  const ents = useEntitlements();
  const [restoring, setRestoring] = useState(false);
  const [info, setInfo] = useState<{ icon: string; title: string; message: string } | null>(null);
  const coach = useCoachMark("coach_shop");
  const premiumRef = useRef<View>(null);

  const priceFor = (productId: string, fallback: string) => {
    const pkg = offering?.availablePackages.find((p) => p.product.identifier === productId);
    return pkg?.product.priceString ?? fallback;
  };

  const goToPaywall = (packId: "premium" | "angel" | "demon") => {
    haptics.tap();
    router.push(`/pack/${packId}`);
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      haptics.select();
      await restorePurchases();
      setInfo({
        icon: "✅",
        title: t("shop.restoreTitle", "Restauration"),
        message: t("shop.restoreOk", "Tes achats ont été restaurés."),
      });
    } catch (e: any) {
      setInfo({
        icon: "⚠️",
        title: t("common.error", "Erreur"),
        message: e?.message ?? t("shop.restoreFailed", "La restauration a échoué."),
      });
    } finally {
      setRestoring(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={["top"]}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", height: 56, paddingTop: 8, paddingHorizontal: 16, paddingBottom: 4 }}>
        <IconBtn color="white" onPress={() => router.back()}>
          ‹
        </IconBtn>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontFamily: "Fredoka_700Bold",
            fontSize: 22,
            color: colors.onSurface,
          }}
        >
          {t("shop.title", "Boutique")}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium hero — tap navigates to paywall */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)} style={{ marginBottom: 20 }}>
          <View ref={premiumRef} collapsable={false}>
            <PremiumHero
              eyebrow={t("shop.premium.eyebrow", "Le meilleur de Flipia")}
              title={t("shop.premium.title", "Passe en Premium")}
              subtitle={t("shop.premium.subtitle", "Tous les thèmes, XP ×2, modes exclusifs. Un seul paiement, débloqué à vie.")}
              cta={t("shop.premium.cta", "Débloquer")}
              price={priceFor(PRODUCT_ID.PREMIUM_LIFETIME, PACKS.premium.fallbackPrice)}
              originalPrice={originalPriceFor(offering, PRODUCT_ID.PREMIUM_LIFETIME, DISCOUNT.PREMIUM)}
              owned={ents.premium}
              ownedLabel={t("shop.ownedPremium", "✓ Premium acquis")}
              onPress={() => goToPaywall("premium")}
            />
          </View>
        </Animated.View>

        {/* Hearts — story campaign retries */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <HeartsSection onInfo={setInfo} />
        </Animated.View>

        {/* Section label row */}
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
          <Label text={t("shop.sectionPacks", "Starter Packs")} style={{ marginBottom: 0 }} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="flame" size={12} color="#E8714A" />
            <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 11, color: colors.p2 }}>
              {t("shop.sectionPacksBadge", "Populaires")}
            </Text>
          </View>
        </View>

        {/* Pack Ange */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={{ marginBottom: 16 }}>
          <PackCard
            iconType="angel"
            gradient={["#E8F1FE", "#5DA9FE"]}
            miniCards={[
              { symbol: "☁", color: "#5DA9FE", rotate: -10 },
              { symbol: "✦", color: "#534AB7", rotate: 4 },
              { symbol: "☀", color: "#D4820A", rotate: 14 },
            ]}
            title={t("shop.packAngel.title", "Pack Ange")}
            count={t("shop.packAngel.count", "12 cartes célestes")}
            description={t("shop.packAngel.description", "Symboles célestes et animations douces")}
            ctaLabel={t("shop.ctaShort", "Acheter")}
            price={priceFor(PRODUCT_ID.PACK_ANGEL, PACKS.angel.fallbackPrice)}
            ownedLabel={t("shop.owned", "Possédé")}
            owned={ents.angel}
            onPress={() => goToPaywall("angel")}
          />
        </Animated.View>

        {/* Pack Démon */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <PackCard
            iconType="demon"
            gradient={["#2D1A12", "#A2340A"]}
            miniCards={[
              { symbol: "▲", color: "#A2340A", rotate: -10 },
              { symbol: "◆", color: "#1A1C17", rotate: 4 },
              { symbol: "✹", color: "#E8714A", rotate: 14 },
            ]}
            title={t("shop.packDemon.title", "Pack Démon")}
            count={t("shop.packDemon.count", "12 cartes infernales")}
            description={t("shop.packDemon.description", "Symboles infernaux et effets de flammes")}
            badge={t("shop.packDemon.badge", "HOT")}
            ctaLabel={t("shop.ctaShort", "Acheter")}
            price={priceFor(PRODUCT_ID.PACK_DEMON, PACKS.demon.fallbackPrice)}
            ownedLabel={t("shop.owned", "Possédé")}
            owned={ents.demon}
            onPress={() => goToPaywall("demon")}
            style={{ marginBottom: 28 }}
          />
        </Animated.View>

        {/* Restore footer */}
        <Pressable
          onPress={handleRestore}
          disabled={restoring}
          style={{ alignItems: "center", paddingTop: 4, paddingBottom: 12 }}
        >
          <Text
            style={{
              fontFamily: "Nunito_700Bold",
              fontSize: 12,
              color: colors.onSurfaceMuted,
              textDecorationLine: "underline",
            }}
          >
            {restoring ? t("shop.restoring", "Restauration…") : t("shop.restore", "Restaurer mes achats")}
          </Text>
        </Pressable>

        {!isReady && (
          <Text style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: colors.onSurfaceMuted }}>
            …
          </Text>
        )}
      </ScrollView>

      <ConfirmModal
        visible={!!info}
        icon={info?.icon}
        title={info?.title ?? ""}
        message={info?.message ?? ""}
        cancelText=""
        confirmText="OK"
        onCancel={() => setInfo(null)}
        onConfirm={() => setInfo(null)}
      />

      {coach.show && !info && (
        <SpotlightCoach
          targetRef={premiumRef}
          text={t("onboarding.coach.shop")}
          hue="gold"
          onDismiss={coach.dismiss}
          onPressTarget={() => {
            coach.dismiss();
            goToPaywall("premium");
          }}
        />
      )}
    </SafeAreaView>
  );
}
