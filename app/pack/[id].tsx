import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter, Redirect } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
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
import { ConfirmModal } from "../../components/ui/ConfirmModal";

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
  const insets = useSafeAreaInsets();
  const { offering, isReady, refreshOfferings } = useRevenueCat();
  const ents = useEntitlements();
  const [busy, setBusy] = useState<"buy" | "restore" | null>(null);
  const [modal, setModal] = useState<{ icon: string; title: string; message: string } | null>(null);

  // If the offering didn't load at boot (network flake on first launch),
  // retry whenever the paywall is opened.
  useEffect(() => {
    if (isReady && !offering) refreshOfferings();
  }, [isReady, offering, refreshOfferings]);

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
      // Most common cause: pack not distributed in user's Play Store country.
      setModal({
        icon: "🌍",
        title: t("pack.unavailableTitle", "Pack indisponible"),
        message: t(
          "pack.unavailableBody",
          "Cet achat n'est pas disponible dans ton pays. Vérifie le pays configuré dans Play Store → Paramètres → Pays et profils, ou réessaye plus tard.",
        ),
      });
      return;
    }
    try {
      setBusy("buy");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await purchaseProduct(pack.productId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      if (!e?.userCancelled) {
        setModal({
          icon: "⚠️",
          title: t("common.error", "Erreur"),
          message: e?.message ?? t("shop.purchaseFailed", "L'achat n'a pas pu aboutir."),
        });
      }
    } finally {
      setBusy(null);
    }
  };

  const handleRestore = async () => {
    try {
      setBusy("restore");
      await restorePurchases();
      setModal({
        icon: "✅",
        title: t("shop.restoreTitle", "Restauration"),
        message: t("shop.restoreOk", "Tes achats ont été restaurés."),
      });
    } catch (e: any) {
      setModal({
        icon: "⚠️",
        title: t("common.error", "Erreur"),
        message: e?.message ?? t("shop.restoreFailed", "La restauration a échoué."),
      });
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

        {/* Avatar reveal — transparent on the atmosphere */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(300)}
          style={{
            marginTop: 22,
            marginHorizontal: 22,
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14,
          }}
        >
          <View
            style={{
              width: 64, height: 64, borderRadius: 32,
              backgroundColor: `hsl(${avatarHue}, 60%, 70%)`,
              borderWidth: 2, borderColor: pack.cta,
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 36, lineHeight: 44 }}>{pack.emoji}</Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: 10, fontFamily: "Nunito_700Bold", letterSpacing: 1.2,
                color: pack.glow, opacity: 0.95,
              }}
            >
              + {t("pack.avatarChip", "AVATAR EXCLUSIF")}
            </Text>
            <Text
              style={{
                fontFamily: "Fredoka_700Bold", fontSize: 18, color: "#FFFFFF", marginTop: 2,
              }}
            >
              {avatarLabel(pack.id, t)}
            </Text>
          </View>
        </Animated.View>

        {/* Feature chips — wrapped row */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(350)}
          style={{
            flexDirection: "row", flexWrap: "wrap", gap: 8,
            justifyContent: "center",
            paddingHorizontal: 22, marginTop: 16,
          }}
        >
          {pack.features.map((f, i) => {
            const icon =
              f.kind === "perk" ? f.icon
              : f.kind === "avatar" ? f.emoji
              : "🎴";
            const title = t(`packs.${pack.id}.features.${f.i18nKey}.title`);
            return (
              <View
                key={i}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 6,
                  backgroundColor: "rgba(0,0,0,0.32)",
                  borderColor: pack.cta + "55", borderWidth: 1,
                  borderRadius: 999,
                  paddingVertical: 7, paddingHorizontal: 12,
                }}
              >
                <Text style={{ fontSize: 13 }}>{icon}</Text>
                <Text style={{ fontSize: 12, fontFamily: "Nunito_700Bold", color: "#FFFFFF" }}>
                  {title}
                </Text>
              </View>
            );
          })}
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
                : t("pack.unlock", "Débloquer")}
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

      <ConfirmModal
        visible={!!modal}
        icon={modal?.icon}
        title={modal?.title ?? ""}
        message={modal?.message ?? ""}
        cancelText=""
        confirmText="OK"
        onCancel={() => setModal(null)}
        onConfirm={() => setModal(null)}
      />
    </View>
  );
}

function avatarLabel(packId: PackId, t: (k: string) => string): string {
  if (packId === "premium") return t("avatars.crown");
  if (packId === "angel") return t("avatars.angel");
  return t("avatars.demon");
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
