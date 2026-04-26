import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter, Redirect } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";
import { Gradient } from "../../components/ui/Gradient";
import { PACKS } from "../../lib/packs";
import {
  AVATAR_SKINS,
  TABLE_SKINS,
  type PackId,
  type CardSkin,
} from "../../lib/skins";
import { purchaseProduct, restorePurchases, useRevenueCat } from "../../lib/revenuecat";
import { useEntitlements } from "../../hooks/useEntitlements";
import { PlateauPreview } from "../../components/preview/PlateauPreview";

const SKIN_BY_PACK: Record<PackId, CardSkin> = {
  premium: "royal",
  angel: "heaven",
  demon: "inferno",
};

const TABLE_BY_PACK: Record<PackId, string> = {
  premium: "premium",
  angel: "angel",
  demon: "demon",
};

export default function PackPreviewScreen() {
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
  const skin = SKIN_BY_PACK[pack.id];
  const tableSkin = TABLE_SKINS.find((tb) => tb.id === TABLE_BY_PACK[pack.id]);
  const avatar = AVATAR_SKINS.find((a) => a.emoji === pack.emoji);
  const avatarHue = avatar?.hue ?? 48;

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
      Alert.alert(
        t("shop.soonTitle", "Bientôt disponible"),
        t("shop.soonBody", "Les achats seront activés à la sortie de la V1."),
      );
      return;
    }
    try {
      setBusy("buy");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await purchaseProduct(pack.productId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      if (!e?.userCancelled)
        Alert.alert(t("common.error", "Erreur"), e?.message ?? t("shop.purchaseFailed", "L'achat n'a pas pu aboutir."));
    } finally {
      setBusy(null);
    }
  };

  const handleRestore = async () => {
    try {
      setBusy("restore");
      await restorePurchases();
      Alert.alert(
        t("shop.restoreTitle", "Restauration"),
        t("shop.restoreOk", "Tes achats ont été restaurés."),
      );
    } catch (e: any) {
      Alert.alert(t("common.error", "Erreur"), e?.message ?? t("shop.restoreFailed", "La restauration a échoué."));
    } finally {
      setBusy(null);
    }
  };

  const ctaBg = owned ? "#3DDC97" : pack.cta;
  const ctaText = owned ? "#08210F" : pack.ctaText;

  return (
    <View style={{ flex: 1, backgroundColor: pack.gradient[0] }}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 220 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Atmospheric backbone — scrolls with content (covers hero zone) */}
        <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 640 }}>
          <Gradient
            colors={[pack.gradient[0], pack.gradient[1]]}
            angle={pack.gradientAngle}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <View
            style={{
              position: "absolute", top: -100, left: 0, right: 0,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 360, height: 360, borderRadius: 180,
                backgroundColor: pack.glow, opacity: 0.18,
              }}
            />
          </View>
        </View>

        {/* Header — back + eyebrow */}
        <View
          style={{
            flexDirection: "row", alignItems: "center",
            paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 4,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.14)",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{
                fontFamily: "Nunito_700Bold", fontSize: 10, letterSpacing: 2,
                color: pack.glow, opacity: 0.95,
              }}
            >
              ● {t("pack.eyebrow", "APERÇU DU PACK")} ●
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Title */}
        <Animated.View entering={FadeIn.duration(300).delay(50)} style={{ alignItems: "center", paddingHorizontal: 28, marginTop: 6 }}>
          <Text
            style={{
              fontFamily: "Fredoka_700Bold", fontSize: 32,
              color: "#FFFFFF", letterSpacing: 0.4, textAlign: "center", lineHeight: 36,
            }}
          >
            {t(`packs.${pack.id}.title`)}
          </Text>
          <Text
            style={{
              marginTop: 4, fontSize: 13, fontFamily: "Nunito_600SemiBold",
              color: "rgba(255,255,255,0.82)", textAlign: "center",
            }}
          >
            {t(`packs.${pack.id}.tagline`)}
          </Text>
        </Animated.View>

        {/* Plateau preview hero — uses the same chrome as in-game */}
        {tableSkin && (
          <Animated.View
            entering={FadeIn.duration(400).delay(150)}
            style={{
              marginTop: 18,
              marginHorizontal: 16,
              height: 420,
              borderRadius: 24,
              overflow: "hidden",
            }}
          >
            <PlateauPreview skin={skin} />
          </Animated.View>
        )}

        {/* Caption under preview */}
        <Animated.View entering={FadeIn.duration(300).delay(250)} style={{ alignItems: "center", marginTop: 10 }}>
          <View
            style={{
              flexDirection: "row", alignItems: "center", gap: 6,
              backgroundColor: "rgba(0,0,0,0.30)",
              paddingVertical: 5, paddingHorizontal: 12,
              borderRadius: 999,
              borderWidth: 1, borderColor: pack.cta + "55",
            }}
          >
            <Ionicons name="eye" size={12} color={pack.glow} />
            <Text
              style={{
                fontFamily: "Nunito_700Bold", fontSize: 10,
                letterSpacing: 1, color: "#FFFFFF",
              }}
            >
              {t("pack.previewCaption", "PLATEAU EN JEU")} · {tableSkin?.name}
            </Text>
          </View>
        </Animated.View>

        {/* Loot card — what's in the pack */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(300)}
          style={{
            marginTop: 22,
            marginHorizontal: 22,
            backgroundColor: colors.surface,
            borderRadius: 24,
            padding: 18,
          }}
        >
          <Text
            style={{
              fontSize: 11, fontFamily: "Nunito_700Bold",
              color: colors.onSurfaceMuted, letterSpacing: 1.4, marginBottom: 14,
            }}
          >
            {t("pack.contents", "DANS CE PACK")}
          </Text>

          {/* Avatar row */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <View
              style={{
                width: 64, height: 64, borderRadius: 32,
                backgroundColor: `hsl(${avatarHue}, 60%, 88%)`,
                borderWidth: 2.5, borderColor: pack.cta,
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 36, lineHeight: 44 }}>{pack.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontFamily: "Nunito_700Bold", letterSpacing: 1, color: colors.onSurfaceMuted }}>
                {t("pack.avatarChip", "AVATAR EXCLUSIF")}
              </Text>
              <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 17, color: colors.onSurface, marginTop: 1 }}>
                {avatarLabel(pack.id, t)}
              </Text>
              <Text style={{ fontSize: 11, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceMuted, marginTop: 1 }}>
                {t(`packs.${pack.id}.features.avatar.description`, "Avatar exclusif")}
              </Text>
            </View>
          </View>

          {/* Plateau row */}
          {tableSkin && (
            <View
              style={{
                flexDirection: "row", alignItems: "center", gap: 14,
                paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.08)",
              }}
            >
              <View
                style={{
                  width: 64, height: 64, borderRadius: 14,
                  backgroundColor: tableSkin.preview.frame,
                  borderWidth: 2.5, borderColor: pack.cta,
                  alignItems: "center", justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <View style={{ flexDirection: "row", gap: 3 }}>
                  <View style={{ width: 12, height: 18, borderRadius: 3, backgroundColor: tableSkin.preview.back }} />
                  <View style={{ width: 12, height: 18, borderRadius: 3, backgroundColor: tableSkin.preview.face }} />
                  <View style={{ width: 12, height: 18, borderRadius: 3, backgroundColor: tableSkin.preview.back }} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, fontFamily: "Nunito_700Bold", letterSpacing: 1, color: colors.onSurfaceMuted }}>
                  {t("pack.tableChip", "PLATEAU EXCLUSIF")}
                </Text>
                <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 17, color: colors.onSurface, marginTop: 1 }}>
                  {tableSkin.name}
                </Text>
                <Text style={{ fontSize: 11, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceMuted, marginTop: 1 }}>
                  {t(`packs.${pack.id}.features.table.description`, "Plateau exclusif")}
                </Text>
              </View>
            </View>
          )}

          {/* Premium-only perks */}
          {pack.id === "premium" && (
            <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.08)", gap: 10 }}>
              <PerkRow icon="🚫" title={t("packs.premium.features.noAds.title")} desc={t("packs.premium.features.noAds.description")} colors={colors} />
              <PerkRow icon="⚡" title={t("packs.premium.features.xpBoost.title")} desc={t("packs.premium.features.xpBoost.description")} colors={colors} />
            </View>
          )}
        </Animated.View>

        {/* Trust strip */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(400)}
          style={{
            marginTop: 14,
            marginHorizontal: 22,
            flexDirection: "row", justifyContent: "space-around",
            paddingVertical: 12, paddingHorizontal: 8,
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: 14,
          }}
        >
          <TrustItem icon="infinite" label={t("pack.trustLifetime", "À vie")} />
          <TrustItem icon="card-outline" label={t("pack.trustNoSubscription", "Sans abonnement")} />
          <TrustItem icon="refresh" label={t("pack.trustRestore", "Restaurable")} />
        </Animated.View>
      </ScrollView>

      {/* Sticky CTA */}
      <View
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          paddingHorizontal: 22, paddingTop: 14,
          paddingBottom: Math.max(insets.bottom, 12) + 6,
          backgroundColor: pack.gradient[0],
        }}
      >
        <Pressable
          onPress={owned ? () => router.back() : handleBuy}
          disabled={busy === "buy" || !isReady}
          style={({ pressed }) => ({
            opacity: !isReady ? 0.6 : pressed ? 0.85 : 1,
          })}
        >
          <View
            style={{
              backgroundColor: ctaBg,
              paddingVertical: 18,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16, fontFamily: "Nunito_700Bold",
                color: ctaText, letterSpacing: 0.3,
              }}
            >
              {owned
                ? t("pack.owned", "✓ Tu possèdes déjà ce pack")
                : busy === "buy"
                ? t("pack.buying", "Achat en cours…")
                : purchasable
                ? `${t("pack.unlock", "Débloquer")} — ${price}`
                : t("pack.soon", "Bientôt disponible")}
            </Text>
          </View>
        </Pressable>

        {!owned && (
          <Pressable
            onPress={handleRestore}
            disabled={busy === "restore"}
            hitSlop={8}
            style={{ alignSelf: "center", marginTop: 8, padding: 4 }}
          >
            <Text
              style={{
                fontSize: 11, fontFamily: "Nunito_600SemiBold",
                color: "rgba(255,255,255,0.6)", textDecorationLine: "underline",
              }}
            >
              {busy === "restore"
                ? t("pack.restoring", "Restauration…")
                : t("pack.restoreCta", "Restaurer mes achats")}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function avatarLabel(packId: PackId, t: (k: string) => string): string {
  if (packId === "premium") return t("avatars.crown");
  if (packId === "angel") return t("avatars.angel");
  return t("avatars.demon");
}

function PerkRow({ icon, title, desc, colors }: { icon: string; title: string; desc: string; colors: any }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <View
        style={{
          width: 38, height: 38, borderRadius: 19,
          backgroundColor: colors.surfaceContainer,
          alignItems: "center", justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>{title}</Text>
        <Text style={{ fontSize: 11, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceMuted }}>{desc}</Text>
      </View>
    </View>
  );
}

function TrustItem({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={{ alignItems: "center", gap: 5 }}>
      <Ionicons name={icon} size={18} color="#FFFFFF" />
      <Text
        style={{
          fontSize: 10, fontFamily: "Nunito_700Bold",
          color: "rgba(255,255,255,0.85)", letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
