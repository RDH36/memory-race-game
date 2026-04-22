import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Gradient } from "../ui/Gradient";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { useCurrentUser } from "../../lib/identity";
import { GoogleLinkSheet } from "./GoogleLinkSheet";

export function ProfileHeader() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { stats, avatar, nickname, level, levelProgress, xpInLevel, xpForNextLevel } = usePlayerStats();
  const { user } = useCurrentUser();

  const [showGoogle, setShowGoogle] = useState(false);

  const hasEmail = !!user?.email;
  const displayName = nickname || t("profile.guest");

  const goToSetup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/auth/setup");
  };

  return (
    <>
      {/* Gradient hero card */}
      <Gradient
        colors={[colors.primary, colors.primaryContainer]}
        angle={135}
        borderRadius={24}
        style={{
          paddingVertical: 26,
          paddingHorizontal: 22,
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

        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Pressable
            onPress={goToSetup}
            style={({ pressed }) => ({
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: "rgba(255,255,255,0.22)",
              alignItems: "center",
              justifyContent: "center",
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
          >
            <Text style={{ fontSize: 52, lineHeight: 60 }}>{avatar}</Text>
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
      </Gradient>

      {/* Link Google CTA — only when not linked */}
      {!hasEmail && (
        <View
          style={{
            marginTop: 12,
            backgroundColor: colors.surfaceContainer,
            borderRadius: 14,
            paddingVertical: 12,
            paddingHorizontal: 14,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: colors.primaryContainerBg,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 18 }}>🔒</Text>
          </View>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontSize: 13, fontFamily: "Fredoka_600SemiBold", color: colors.onSurface }}>
              {t("auth.protectTitle")}
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Nunito_400Regular",
                color: colors.onSurfaceVariant,
                marginTop: 1,
              }}
            >
              {t("profile.protectSubtitle")}
            </Text>
          </View>
          <Pressable
            onPress={() => setShowGoogle(true)}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 18,
              paddingVertical: 10,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 13, fontFamily: "Nunito_700Bold", color: "#FFF" }}>
              {t("profile.linkShort")}
            </Text>
          </Pressable>
        </View>
      )}

      <GoogleLinkSheet visible={showGoogle} onClose={() => setShowGoogle(false)} />
    </>
  );
}
