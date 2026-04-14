import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StatsRow } from "../../components/home/StatsRow";
import { Label } from "../../components/ui/Label";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { MitsitsyCard } from "../../components/promo/MitsitsyCard";

const DAILY_REWARD_KEY = "daily_reward_last_claimed";
const DAILY_REWARD_XP = 15;

function isSameDay(ts1: number, ts2: number) {
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { stats, avatar, level, levelProgress, xpInLevel, xpForNextLevel, addBonusXp } = usePlayerStats();
  const { colors, isDark } = useTheme();
  const [dailyClaimed, setDailyClaimed] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(DAILY_REWARD_KEY).then((val) => {
      if (!val || !isSameDay(parseInt(val, 10), Date.now())) {
        setDailyClaimed(false);
      }
    });
  }, []);

  const claimDailyReward = useCallback(() => {
    if (dailyClaimed) return;
    addBonusXp(DAILY_REWARD_XP);
    setDailyClaimed(true);
    AsyncStorage.setItem(DAILY_REWARD_KEY, Date.now().toString());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [dailyClaimed, addBonusXp]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginTop: 8, marginBottom: 28 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View style={{ flex: 1 }}>
              <Label text={t("home.welcome")} style={{ marginBottom: 6 }} />
              <Text style={{ fontSize: 36, color: colors.primaryContainer }} className="font-display">
                Flipia
              </Text>
            </View>
            <View style={{ alignItems: "center", marginTop: 8 }}>
              <Text style={{ fontSize: 42 }}>{avatar}</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 6,
                  backgroundColor: colors.primaryContainerBg,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontSize: 13, fontFamily: "Nunito_700Bold", color: colors.primaryContainer }}>
                  Nv. {level} · {stats.points} XP
                </Text>
              </View>
            </View>
          </View>

          {/* XP bar */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 14, gap: 8 }}>
            <Text style={{ fontSize: 11, fontFamily: "Nunito_700Bold", color: colors.onSurface }}>
              Nv. {level}
            </Text>
            <View style={{ flex: 1, height: 4, backgroundColor: isDark ? "#333" : "#E8E4E4", borderRadius: 2 }}>
              <View style={{ width: `${Math.round(levelProgress * 100)}%`, height: 4, backgroundColor: colors.primaryContainer, borderRadius: 2 }} />
            </View>
            <Text style={{ fontSize: 11, fontFamily: "Nunito_700Bold", color: colors.onSurfaceVariant }}>
              Nv. {level + 1}
            </Text>
          </View>
          <Text style={{ fontSize: 10, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, textAlign: "right", marginTop: 4 }}>
            {xpInLevel} / {xpForNextLevel} XP
          </Text>
        </View>

        {/* Daily Reward */}
        {!dailyClaimed && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Pressable
              onPress={claimDailyReward}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "#D4820A" + "18",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#D4820A" + "40",
                paddingVertical: 12,
                paddingHorizontal: 16,
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 22 }}>🎁</Text>
              <Text style={{ fontSize: 15, fontFamily: "Fredoka_700Bold", color: "#D4820A" }}>
                {t("home.dailyReward")}
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Hero mode — Casual (primary CTA) */}
        <Animated.View entering={FadeInDown.delay(50).duration(400).springify().damping(14)}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/mode/casual");
            }}
            style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
          >
            <View
              style={{
                backgroundColor: "#1D9E75",
                borderRadius: 20,
                paddingVertical: 28,
                paddingHorizontal: 24,
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                shadowColor: "#1D9E75",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 8,
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 32 }}>🔥</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 22, fontFamily: "Fredoka_700Bold", color: "#FFF" }}>
                  {t("home.modes.casual")}
                </Text>
                <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: "rgba(255,255,255,0.75)", marginTop: 4, lineHeight: 17 }}>
                  {t("home.modes.casualDesc")}
                </Text>
              </View>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 20, color: "#FFF", fontFamily: "Fredoka_700Bold" }}>{">"}</Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Secondary modes — 2 columns */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
          {/* Solo */}
          <Animated.View entering={FadeInDown.delay(150).duration(400).springify().damping(14)} style={{ flex: 1 }}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/mode/solo");
              }}
              style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.96 : 1 }] })}
            >
              <View
                style={{
                  backgroundColor: isDark ? colors.surfaceContainerHigh : colors.surfaceContainer,
                  borderRadius: 18,
                  paddingVertical: 20,
                  paddingHorizontal: 16,
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor: "#534AB7" + "25",
                }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: "#534AB7" + "14",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontSize: 26 }}>🎮</Text>
                </View>
                <Text style={{ fontSize: 16, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
                  {t("home.modes.solo")}
                </Text>
                <Text style={{ fontSize: 10, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginTop: 4, textAlign: "center" }} numberOfLines={2}>
                  {t("home.modes.soloDesc")}
                </Text>
                <View
                  style={{
                    backgroundColor: "#534AB7" + "14",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                    marginTop: 10,
                  }}
                >
                  <Text style={{ fontSize: 9, fontFamily: "Nunito_700Bold", color: "#534AB7", letterSpacing: 0.4 }}>
                    {t("home.modes.soloBadge")}
                  </Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>

          {/* Ranked (disabled) */}
          <Animated.View entering={FadeInDown.delay(250).duration(400).springify().damping(14)} style={{ flex: 1 }}>
            <View
              style={{
                backgroundColor: isDark ? colors.surfaceContainerHigh : colors.surfaceContainer,
                borderRadius: 18,
                paddingVertical: 20,
                paddingHorizontal: 16,
                alignItems: "center",
                opacity: 0.45,
                borderWidth: 1.5,
                borderColor: "#A2340A" + "25",
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: "#A2340A" + "14",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 26 }}>🏆</Text>
              </View>
              <Text style={{ fontSize: 16, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
                {t("home.modes.ranked")}
              </Text>
              <Text style={{ fontSize: 10, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginTop: 4, textAlign: "center" }} numberOfLines={2}>
                {t("home.modes.rankedDesc")}
              </Text>
              <View
                style={{
                  backgroundColor: colors.onSurfaceVariant,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  marginTop: 10,
                }}
              >
                <Text style={{ fontSize: 9, fontFamily: "Nunito_700Bold", color: "#fff", letterSpacing: 0.4 }}>
                  {t("settings.comingSoon").toUpperCase()}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Stats */}
        <View style={{ marginTop: 28 }}>
          <Label text={t("home.myStats")} />
          <StatsRow />
        </View>

        {/* Cross-promo */}
        <View style={{ marginTop: 28 }}>
          <MitsitsyCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
