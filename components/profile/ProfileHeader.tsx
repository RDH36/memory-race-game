import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { haptics } from "@/lib/haptics";
import { Btn3D, Panel } from "@/components/ui/arcade";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { useCurrentUser } from "../../lib/identity";
import { getAvatarSkin } from "../../lib/skins";
import { getPremiumTheme } from "../../lib/premiumTheme";
import { PremiumDecor } from "../appearance/PremiumDecor";
import { GoogleLinkSheet } from "./GoogleLinkSheet";

export function ProfileHeader() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { stats, avatar, nickname, level, levelProgress } = usePlayerStats();
  const { user } = useCurrentUser();

  const [showGoogle, setShowGoogle] = useState(false);

  const hasEmail = !!user?.email;
  const displayName = nickname || t("profile.guest");
  const skin = getAvatarSkin(avatar);
  const isPremium = !!getPremiumTheme(skin?.requires ?? null);

  const goToSetup = () => {
    haptics.tap();
    router.push("/auth/setup");
  };

  return (
    <>
      {/* Solid violet hero card (no gradient) */}
      <View
        style={{
          backgroundColor: colors.primary,
          borderRadius: 24,
          paddingVertical: 26,
          paddingHorizontal: 22,
          overflow: "hidden",
          boxShadow: `0 5px 0 ${colors.hues.violet[1]}, 0 18px 30px -14px ${colors.primary}A6`,
        }}
      >
        {/* Decorative circle */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: -24,
            bottom: -24,
            width: 110,
            height: 110,
            borderRadius: 55,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />

        {/* Edit badge — top right */}
        <View style={{ position: "absolute", top: 14, right: 14, zIndex: 1 }}>
          <Pressable
            onPress={goToSetup}
            style={({ pressed }) => ({
              backgroundColor: "rgba(255,255,255,0.22)",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
          >
            <Text style={{ fontSize: 10, fontFamily: "Nunito_700Bold", color: "#FFF", letterSpacing: 0.5 }}>
              {t("profile.editNickname")}
            </Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <Pressable
            onPress={goToSetup}
            style={({ pressed }) => ({
              width: 72,
              height: 72,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.22)",
              transform: [{ scale: pressed ? 0.95 : 1 }],
              overflow: "visible",
              ...(!isPremium && {
                borderWidth: 2.5,
                borderColor: "rgba(255,255,255,0.55)",
              }),
            })}
          >
            <View
              style={{
                width: 72,
                height: 72,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 38,
                  textAlign: "center",
                  ...(Platform.OS === "android" && {
                    includeFontPadding: false,
                    textAlignVertical: "center",
                  }),
                }}
              >
                {avatar}
              </Text>
            </View>
            {isPremium && (
              <PremiumDecor
                emoji={avatar}
                size={72}
                borderRadius={20}
                hideOuterGlow
                strokeWidth={2.5}
                animateAura
                auraInset
                clipAura
              />
            )}
          </Pressable>

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{ fontSize: 22, fontFamily: "Fredoka_700Bold", color: "#FFF" }}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Nunito_400Regular",
                color: "rgba(255,255,255,0.75)",
                marginTop: 3,
              }}
              numberOfLines={1}
            >
              {hasEmail ? `${t("auth.linked")} ${user?.email}` : `${t("profile.guest")} · ${t("profile.guestDesc")}`}
            </Text>

            {/* Level + progress bar */}
            <View style={{ marginTop: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 11, fontFamily: "Nunito_700Bold", color: "#FFF" }}>
                  Nv. {level}
                </Text>
                <Text style={{ fontSize: 10, fontFamily: "Nunito_600SemiBold", color: "rgba(255,255,255,0.85)" }}>
                  {stats.points.toLocaleString()} XP
                </Text>
              </View>
              <View
                style={{
                  height: 6,
                  backgroundColor: "rgba(255,255,255,0.22)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${Math.max(0, Math.min(100, Math.round(levelProgress * 100)))}%`,
                    height: 6,
                    backgroundColor: "#FFF",
                    borderRadius: 999,
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Link Google CTA — only when not linked */}
      {!hasEmail && (
        <Panel
          style={{
            marginTop: 12,
            paddingVertical: 12,
            paddingHorizontal: 14,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: colors.hues.violet[2],
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              boxShadow: `0 3px 0 ${colors.hues.violet[1]}33`,
            }}
          >
            <Text style={{ fontSize: 18 }}>🔒</Text>
          </View>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontSize: 14, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
              {t("auth.protectTitle")}
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Fredoka_700Bold",
                color: colors.onSurfaceMuted,
                marginTop: 1,
              }}
            >
              {t("profile.protectSubtitle")}
            </Text>
          </View>
          <Btn3D
            color="violet"
            size="sm"
            label={t("profile.linkShort")}
            onPress={() => setShowGoogle(true)}
          />
        </Panel>
      )}

      <GoogleLinkSheet visible={showGoogle} onClose={() => setShowGoogle(false)} />
    </>
  );
}
