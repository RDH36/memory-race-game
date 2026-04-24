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
import {
  AVATAR_SKINS,
  TABLE_SKINS,
  ROYAL_THEME, INFERNO_THEME, HEAVEN_THEME,
  type PackId,
} from "../../lib/skins";
import { purchaseProduct, restorePurchases, useRevenueCat } from "../../lib/revenuecat";
import { useEntitlements } from "../../hooks/useEntitlements";
import { TableMiniPreview } from "../../components/appearance/TableMiniPreview";
import { Crown } from "../../components/ui/icons/Crown";
import { RoyalSealIcon } from "../../components/game/royal/RoyalSealIcon";
import { CelticCross } from "../../components/game/heaven/CelticCross";
import { HeavenHalo } from "../../components/game/heaven/HeavenHalo";
import { GoeticSigil } from "../../components/game/inferno/GoeticSigil";
import { DemonHorn } from "../../components/game/inferno/DemonHorn";

const HERO_HEIGHT = 380;

const TABLE_BY_PACK: Record<PackId, string> = {
  premium: "premium",
  angel: "angel",
  demon: "demon",
};

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
  const tableSkin = TABLE_SKINS.find((tb) => tb.id === TABLE_BY_PACK[pack.id]);
  const cardSkin =
    pack.id === "premium" ? "royal" : pack.id === "demon" ? "inferno" : "heaven";
  // Real in-game avatar this pack unlocks (used as corner ornaments)
  const cornerAvatar = AVATAR_SKINS.find((a) => a.emoji === pack.emoji);
  const cornerHue = cornerAvatar?.hue ?? 48;

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
    <View style={{ flex: 1, backgroundColor: pack.gradient[0] }}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 220 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero (scrolls with content) */}
        <View style={{ height: HERO_HEIGHT, position: "relative" }}>
          <Gradient colors={pack.gradient} angle={pack.gradientAngle} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
            <View pointerEvents="none" style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: pack.glow, opacity: 0.22 }} />
            <View pointerEvents="none" style={{ position: "absolute", bottom: 60, left: -50, width: 180, height: 180, borderRadius: 90, backgroundColor: "#FFFFFF", opacity: 0.07 }} />
          </Gradient>

          {/* Hero content */}
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: insets.top + 30 }}>
            <View style={{ position: "relative", width: 170, height: 170, alignItems: "center", justifyContent: "center" }}>
              <CornerOrnaments packId={pack.id} />
              <View
                style={{
                  width: 138, height: 138, borderRadius: 38,
                  backgroundColor: "rgba(255,255,255,0.16)",
                  alignItems: "center", justifyContent: "center",
                  shadowColor: pack.glow, shadowOpacity: 0.6, shadowRadius: 50, shadowOffset: { width: 0, height: 0 },
                }}
              >
                <HeroSigil packId={pack.id} />
              </View>
            </View>

            <Text style={{ marginTop: 14, fontSize: 32, fontFamily: "Fredoka_700Bold", color: pack.heroText, letterSpacing: 0.3 }}>
              {t(`packs.${pack.id}.title`)}
            </Text>
            <Text style={{ marginTop: 6, fontSize: 13, fontFamily: "Nunito_600SemiBold", color: pack.heroText, opacity: 0.9, textAlign: "center", paddingHorizontal: 32, lineHeight: 18 }}>
              {t(`packs.${pack.id}.pitch`, t(`packs.${pack.id}.tagline`))}
            </Text>

            <View
              style={{
                marginTop: 14,
                backgroundColor: pack.cta,
                paddingHorizontal: 14, paddingVertical: 6,
                borderRadius: 999,
                flexDirection: "row", alignItems: "center", gap: 6,
                shadowColor: pack.glow, shadowOpacity: 0.5, shadowRadius: 12,
              }}
            >
              <Ionicons name="infinite" size={13} color={pack.ctaText} />
              <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 11, color: pack.ctaText, letterSpacing: 0.8 }}>
                {t("pack.lifetimeBadge", "À VIE · UN PAIEMENT")}
              </Text>
            </View>
          </View>
        </View>

        {/* White content card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 32, borderTopRightRadius: 32,
            paddingHorizontal: 22, paddingTop: 28,
            marginTop: -32, // overlap hero a bit
          }}
        >
          {/* "Ton butin" — vertical stack reveal */}
          {tableSkin && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 11, fontFamily: "Nunito_700Bold", color: colors.onSurfaceMuted, letterSpacing: 1.5, marginBottom: 12 }}>
                {t("pack.yourLoot", "TON BUTIN")}
              </Text>

              {/* Avatar reveal card */}
              <View
                style={{
                  backgroundColor: colors.surfaceContainer,
                  borderRadius: 20,
                  paddingVertical: 22, paddingHorizontal: 16,
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 10, fontFamily: "Nunito_700Bold", color: colors.onSurfaceMuted, letterSpacing: 1.2, marginBottom: 14 }}>
                  AVATAR EXCLUSIF
                </Text>
                <View
                  style={{
                    width: 116, height: 116, borderRadius: 58,
                    backgroundColor: `hsl(${cornerHue}, 60%, 88%)`,
                    alignItems: "center", justifyContent: "center",
                    borderWidth: 3,
                    borderColor: pack.cta,
                    shadowColor: pack.glow, shadowOpacity: 0.4, shadowRadius: 20,
                  }}
                >
                  <Text style={{ fontSize: 64, lineHeight: 78 }}>{pack.emoji}</Text>
                </View>
                <Text style={{ marginTop: 12, fontSize: 17, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
                  {avatarLabel(pack.id, t)}
                </Text>
              </View>

              {/* Plateau reveal card */}
              <View
                style={{
                  backgroundColor: colors.surfaceContainer,
                  borderRadius: 20,
                  paddingVertical: 22, paddingHorizontal: 16,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 10, fontFamily: "Nunito_700Bold", color: colors.onSurfaceMuted, letterSpacing: 1.2, marginBottom: 14 }}>
                  PLATEAU EXCLUSIF
                </Text>
                <View
                  style={{
                    width: "100%",
                    borderRadius: 16,
                    overflow: "hidden",
                    borderWidth: 3,
                    borderColor: pack.cta,
                    shadowColor: pack.glow, shadowOpacity: 0.4, shadowRadius: 20,
                  }}
                >
                  <TableMiniPreview
                    frame={tableSkin.preview.frame}
                    back={tableSkin.preview.back}
                    face={tableSkin.preview.face}
                    skin={cardSkin}
                  />
                </View>
                <Text style={{ marginTop: 12, fontSize: 17, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
                  {tableSkin.name}
                </Text>
              </View>
            </View>
          )}

          {pack.id === "premium" && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 11, fontFamily: "Nunito_700Bold", color: colors.onSurfaceMuted, letterSpacing: 1.5, marginBottom: 12 }}>
                {t("pack.includes", "INCLUS AUSSI")}
              </Text>
              <View style={{ gap: 10 }}>
                <PerkRow icon="🚫" title={t(`packs.premium.features.noAds.title`)} desc={t(`packs.premium.features.noAds.description`)} colors={colors} />
                <PerkRow icon="⚡" title={t(`packs.premium.features.xpBoost.title`)} desc={t(`packs.premium.features.xpBoost.description`)} colors={colors} />
              </View>
            </View>
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: 14,
              paddingVertical: 14, paddingHorizontal: 8,
            }}
          >
            <TrustItem icon="infinite" label={t("pack.trustLifetime", "À vie")} colors={colors} />
            <TrustItem icon="card-outline" label={t("pack.trustNoSubscription", "Sans abonnement")} colors={colors} />
            <TrustItem icon="refresh" label={t("pack.trustRestore", "Restaurable")} colors={colors} />
          </View>
        </View>
      </ScrollView>

      {/* Floating close button */}
      <SafeAreaView edges={["top"]} pointerEvents="box-none" style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
        <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingTop: 8 }}>
          <Pressable
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.3)", alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </SafeAreaView>

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
            paddingVertical: 20, borderRadius: 18,
            alignItems: "center", justifyContent: "center",
            transform: [{ scale: pressed ? 0.97 : 1 }],
            opacity: !isReady ? 0.6 : 1,
            shadowColor: ctaBg, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          })}
        >
          <Text style={{ fontSize: 17, fontFamily: "Nunito_700Bold", color: ctaTextColor, letterSpacing: 0.3 }}>
            {owned ? "✓ Tu possèdes déjà ce pack" : busy === "buy" ? "Achat en cours…" : purchasable ? `Acheter — ${price}` : `Bientôt disponible`}
          </Text>
        </Pressable>

        {!owned && (
          <Text style={{ marginTop: 10, fontSize: 11, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceMuted, textAlign: "center" }}>
            {t("pack.bottomTagline", "Achat unique · À vie · Sans abonnement")}
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


function avatarLabel(packId: PackId, t: (k: string) => string): string {
  if (packId === "premium") return t("avatars.crown");
  if (packId === "angel") return t("avatars.angel");
  return t("avatars.demon");
}

function HeroSigil({ packId }: { packId: PackId }) {
  if (packId === "premium") return <RoyalSealIcon size={92} color={ROYAL_THEME.gold} accent={ROYAL_THEME.goldBright} />;
  if (packId === "angel") return <CelticCross size={92} color={HEAVEN_THEME.gold} accent={HEAVEN_THEME.haloBright} />;
  return <GoeticSigil size={92} color={INFERNO_THEME.ember} accent={INFERNO_THEME.emberBright} />;
}

function CornerOrnaments({ packId }: { packId: PackId }) {
  if (packId === "premium") {
    return (
      <>
        <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, transform: [{ rotate: "-18deg" }] }}>
          <Crown size={34} color={ROYAL_THEME.gold} />
        </View>
        <View pointerEvents="none" style={{ position: "absolute", top: 0, right: 0, transform: [{ rotate: "18deg" }] }}>
          <Crown size={34} color={ROYAL_THEME.gold} />
        </View>
      </>
    );
  }
  if (packId === "angel") {
    return (
      <>
        <View pointerEvents="none" style={{ position: "absolute", top: 4, left: 4 }}>
          <HeavenHalo size={30} />
        </View>
        <View pointerEvents="none" style={{ position: "absolute", top: 4, right: 4 }}>
          <HeavenHalo size={30} />
        </View>
      </>
    );
  }
  return (
    <>
      <View pointerEvents="none" style={{ position: "absolute", top: -2, left: 4, transform: [{ rotate: "-22deg" }] }}>
        <DemonHorn size={34} />
      </View>
      <View pointerEvents="none" style={{ position: "absolute", top: -2, right: 4, transform: [{ rotate: "22deg" }] }}>
        <DemonHorn size={34} />
      </View>
    </>
  );
}

function PerkRow({ icon, title, desc, colors }: { icon: string; title: string; desc: string; colors: any }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surfaceContainer, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14 }}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryContainerBg, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>{title}</Text>
        <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginTop: 1 }}>{desc}</Text>
      </View>
    </View>
  );
}

function TrustItem({ icon, label, colors }: { icon: any; label: string; colors: any }) {
  return (
    <View style={{ alignItems: "center", gap: 6 }}>
      <Ionicons name={icon} size={20} color={colors.onSurfaceVariant} />
      <Text style={{ fontSize: 10, fontFamily: "Nunito_700Bold", color: colors.onSurfaceVariant, letterSpacing: 0.3 }}>
        {label}
      </Text>
    </View>
  );
}
