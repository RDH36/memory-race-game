import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter, Redirect } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../lib/ThemeContext";
import { Gradient } from "../../components/ui/Gradient";
import { PACKS } from "../../lib/packs";
import type { PackId } from "../../lib/skins";
import { purchaseProduct, restorePurchases, useRevenueCat } from "../../lib/revenuecat";
import { useEntitlements } from "../../hooks/useEntitlements";
import { FeatureRow, type FeatureDisplay } from "../../components/shop/FeatureRow";

const HERO_HEIGHT = 380;

export default function PackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { offering, isReady } = useRevenueCat();
  const ents = useEntitlements();
  const [busy, setBusy] = useState<"buy" | "restore" | null>(null);

  if (!id || !(id in PACKS)) return <Redirect href="/(tabs)/shop" />;

  const pack = PACKS[id as PackId];

  // Hydrate feature specs with i18n strings
  const features: FeatureDisplay[] = pack.features.map((spec) => ({
    ...spec,
    title: t(`packs.${pack.id}.features.${spec.i18nKey}.title`),
    description: t(`packs.${pack.id}.features.${spec.i18nKey}.description`),
  }));
  const owned =
    (pack.id === "premium" && ents.premium) ||
    (pack.id === "angel" && ents.angel) ||
    (pack.id === "demon" && ents.demon);

  const offeringPackage = offering?.availablePackages.find(
    (p) => p.product.identifier === pack.productId,
  );
  const price = offeringPackage?.product.priceString ?? pack.fallbackPrice;
  const purchasable = !!offering;

  const handleBuy = async () => {
    if (!purchasable) {
      Alert.alert("Bientôt disponible", "Les achats seront activés à la sortie de la V1.");
      return;
    }
    try {
      setBusy("buy");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await purchaseProduct(pack.productId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      if (!e?.userCancelled) Alert.alert("Erreur", e?.message ?? "L'achat n'a pas pu aboutir.");
    } finally {
      setBusy(null);
    }
  };

  const handleRestore = async () => {
    try {
      setBusy("restore");
      await restorePurchases();
      Alert.alert("Restauration", "Tes achats ont été restaurés.");
    } catch (e: any) {
      Alert.alert("Erreur", e?.message ?? "La restauration a échoué.");
    } finally {
      setBusy(null);
    }
  };

  const ctaBg = owned ? colors.success : pack.cta;
  const ctaTextColor = owned ? "#FFFFFF" : pack.ctaText;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <StatusBar style="light" />
      {/* Hero (full bleed, behind content) */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: HERO_HEIGHT }}>
        <Gradient colors={pack.gradient} angle={pack.gradientAngle} style={{ flex: 1 }}>
          {/* Decorative blurred orbs */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute", top: -60, right: -60,
              width: 220, height: 220, borderRadius: 110,
              backgroundColor: pack.glow, opacity: 0.18,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute", bottom: 40, left: -40,
              width: 160, height: 160, borderRadius: 80,
              backgroundColor: "#FFFFFF", opacity: 0.06,
            }}
          />
        </Gradient>
      </View>

      {/* Top close button */}
      <SafeAreaView edges={["top"]} pointerEvents="box-none">
        <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingTop: 8 }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: "rgba(0,0,0,0.25)",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Hero content (emoji + title + tagline) */}
      <View style={{ position: "absolute", top: insets.top + 56, left: 0, right: 0, alignItems: "center" }}>
        <View
          style={{
            width: 132, height: 132, borderRadius: 36,
            backgroundColor: "rgba(255,255,255,0.15)",
            alignItems: "center", justifyContent: "center",
            shadowColor: pack.glow, shadowOpacity: 0.5, shadowRadius: 40, shadowOffset: { width: 0, height: 0 },
          }}
        >
          <Text style={{ fontSize: 76, lineHeight: 92 }}>{pack.emoji}</Text>
        </View>
        <Text style={{ marginTop: 18, fontSize: 32, fontFamily: "Fredoka_700Bold", color: pack.heroText, letterSpacing: 0.5 }}>
          {t(`packs.${pack.id}.title`)}
        </Text>
        <Text style={{ marginTop: 4, fontSize: 13, fontFamily: "Nunito_600SemiBold", color: pack.heroText, opacity: 0.85, textAlign: "center", paddingHorizontal: 32 }}>
          {t(`packs.${pack.id}.tagline`)}
        </Text>
      </View>

      {/* Content card overlapping hero */}
      <ScrollView
        style={{ flex: 1, marginTop: HERO_HEIGHT - 40 }}
        contentContainerStyle={{ paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 32, borderTopRightRadius: 32,
            paddingHorizontal: 22, paddingTop: 28,
          }}
        >
          <Text style={{ fontSize: 11, fontFamily: "Nunito_700Bold", color: colors.onSurfaceMuted, letterSpacing: 1.5, marginBottom: 4 }}>
            {t("pack.includes", "CE QUE TU OBTIENS")}
          </Text>

          <View style={{ marginTop: 4 }}>
            {features.map((f, i) => (
              <View key={i}>
                <FeatureRow feature={f} />
                {i < features.length - 1 && (
                  <View style={{ height: 1, backgroundColor: colors.ghostBorder, marginLeft: 70 }} />
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          paddingHorizontal: 22, paddingTop: 14,
          paddingBottom: Math.max(insets.bottom, 16) + 8,
          backgroundColor: colors.surface,
        }}
      >
        <Pressable
          onPress={owned ? () => router.back() : handleBuy}
          disabled={busy === "buy" || !isReady}
          style={({ pressed }) => ({
            backgroundColor: ctaBg,
            paddingVertical: 18, borderRadius: 18,
            alignItems: "center", justifyContent: "center",
            transform: [{ scale: pressed ? 0.97 : 1 }],
            opacity: !isReady ? 0.6 : 1,
          })}
        >
          <Text style={{ fontSize: 16, fontFamily: "Nunito_700Bold", color: ctaTextColor }}>
            {owned
              ? "✓ Tu possèdes déjà ce pack"
              : busy === "buy"
                ? "Achat en cours…"
                : purchasable ? `Acheter — ${price}` : `Bientôt disponible`}
          </Text>
        </Pressable>

        {!owned && (
          <Text style={{ marginTop: 10, fontSize: 11, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceMuted, textAlign: "center" }}>
            Achat unique · À vie · Sans abonnement
          </Text>
        )}

        <Pressable
          onPress={handleRestore}
          disabled={busy === "restore"}
          style={{ marginTop: 4, alignItems: "center", padding: 6 }}
        >
          <Text style={{ fontSize: 12, fontFamily: "Nunito_700Bold", color: colors.primaryContainer }}>
            {busy === "restore" ? "Restauration…" : "Restaurer mes achats"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
