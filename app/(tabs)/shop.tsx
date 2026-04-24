import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";
import { Label } from "../../components/ui/Label";
import { useEntitlements } from "../../hooks/useEntitlements";
import { useRevenueCat, restorePurchases, PRODUCT_ID } from "../../lib/revenuecat";
import { PACKS } from "../../lib/packs";
import { PremiumHero } from "../../components/shop/PremiumHero";
import { PackCard } from "../../components/shop/PackCard";

export default function ShopScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { offering, isReady } = useRevenueCat();
  const ents = useEntitlements();
  const [restoring, setRestoring] = useState(false);

  const priceFor = (productId: string, fallback: string) => {
    const pkg = offering?.availablePackages.find((p) => p.product.identifier === productId);
    return pkg?.product.priceString ?? fallback;
  };

  const goToPaywall = (packId: "premium" | "angel" | "demon") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/pack/${packId}`);
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      Haptics.selectionAsync();
      await restorePurchases();
      Alert.alert(t("shop.restoreTitle", "Restauration"), t("shop.restoreOk", "Tes achats ont été restaurés."));
    } catch (e: any) {
      Alert.alert(t("common.error", "Erreur"), e?.message ?? t("shop.restoreFailed", "La restauration a échoué."));
    } finally {
      setRestoring(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={["top"]}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", height: 56, paddingTop: 8, paddingHorizontal: 16, paddingBottom: 4 }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: colors.surfaceContainer,
            alignItems: "center", justifyContent: "center",
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontFamily: "Fredoka_700Bold",
            fontSize: 20,
            color: colors.onSurface,
            letterSpacing: -0.3,
          }}
        >
          {t("shop.title", "Boutique")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium hero — tap navigates to paywall */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)} style={{ marginBottom: 20 }}>
          <PremiumHero
            eyebrow={t("shop.premium.eyebrow", "Le meilleur de Flipia")}
            title={t("shop.premium.title", "Passe en Premium")}
            subtitle={t("shop.premium.subtitle", "Tous les thèmes, XP ×2, modes exclusifs. Un seul paiement, débloqué à vie.")}
            cta={t("shop.premium.cta", "Débloquer")}
            price={priceFor(PRODUCT_ID.PREMIUM_LIFETIME, PACKS.premium.fallbackPrice)}
            owned={ents.premium}
            ownedLabel={t("shop.ownedPremium", "✓ Premium acquis")}
            onPress={() => goToPaywall("premium")}
          />
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
    </SafeAreaView>
  );
}
