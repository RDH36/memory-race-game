import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Gradient } from "../../components/ui/Gradient";
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
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { stats, avatar, level, levelProgress, xpInLevel, xpForNextLevel, addBonusXp } =
    usePlayerStats();
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

  const xpBarTrack = isDark ? "#2A2532" : "#E8E4E4";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header — logo left, avatar + level chip right */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginTop: 8,
            marginBottom: 24,
          }}
        >
          <View style={{ flex: 1 }}>
            <Label text={t("home.welcome")} style={{ marginBottom: 0 }} />
            <Text
              style={{
                fontSize: 38,
                fontFamily: "Fredoka_700Bold",
                color: colors.primaryContainer,
                lineHeight: 40,
                marginTop: 4,
                letterSpacing: -0.76,
              }}
            >
              Flipia
            </Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 6 }}>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/profile");
              }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: colors.primaryContainerBg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 26 }}>{avatar}</Text>
            </Pressable>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: colors.primaryContainerBg,
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 999,
              }}
            >
              <Text style={{ fontSize: 10 }}>⚡</Text>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Nunito_700Bold",
                  color: colors.primaryContainer,
                }}
              >
                Nv. {level} · {stats.points} XP
              </Text>
            </View>
          </View>
        </View>

        {/* XP bar */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Nunito_700Bold",
                color: colors.onSurface,
              }}
            >
              Nv. {level}
            </Text>
            <View
              style={{
                flex: 1,
                height: 5,
                backgroundColor: xpBarTrack,
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${Math.max(0, Math.min(100, Math.round(levelProgress * 100)))}%`,
                  height: 5,
                  backgroundColor: colors.primaryContainer,
                  borderRadius: 999,
                }}
              />
            </View>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Nunito_700Bold",
                color: colors.onSurfaceMuted,
              }}
            >
              Nv. {level + 1}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 10,
              fontFamily: "Nunito_400Regular",
              color: colors.onSurfaceMuted,
              textAlign: "right",
              marginTop: 3,
            }}
          >
            {xpInLevel} / {xpForNextLevel} XP
          </Text>
        </View>

        {/* Daily reward banner */}
        {!dailyClaimed && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Pressable
              onPress={claimDailyReward}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                backgroundColor: colors.warningBg,
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 18,
                marginBottom: 20,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 20 }}>🎁</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Fredoka_600SemiBold",
                    color: colors.warning,
                  }}
                >
                  {t("home.dailyReward")}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Nunito_400Regular",
                    color: colors.onSurfaceMuted,
                    marginTop: 1,
                  }}
                >
                  Réclame tes +{DAILY_REWARD_XP} XP gratuits
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Fredoka_700Bold",
                  color: colors.warning,
                }}
              >
                +{DAILY_REWARD_XP} →
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* HERO MODE — Casual (primary CTA) */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)} style={{ marginBottom: 14 }}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/mode/casual");
            }}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <Gradient
              colors={["#1D9E75", "#17835F"]}
              angle={135}
              borderRadius={22}
              style={{
                paddingVertical: 22,
                paddingHorizontal: 20,
              }}
            >
              {/* Decorative floating cards — positioned inside bounds to avoid clipping */}
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  right: 6,
                  top: 8,
                  width: 52,
                  height: 70,
                  borderRadius: 10,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  transform: [{ rotate: "14deg" }],
                }}
              />
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  right: 46,
                  top: 14,
                  width: 46,
                  height: 62,
                  borderRadius: 10,
                  backgroundColor: "rgba(255,255,255,0.18)",
                  transform: [{ rotate: "-6deg" }],
                }}
              />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    backgroundColor: "rgba(255,255,255,0.22)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 30 }}>🔥</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "Nunito_700Bold",
                      letterSpacing: 1.2,
                      color: "rgba(255,255,255,0.75)",
                    }}
                  >
                    {t("home.featuredMode")}
                  </Text>
                  <Text
                    style={{
                      fontSize: 24,
                      fontFamily: "Fredoka_700Bold",
                      color: "#FFFFFF",
                      marginTop: 2,
                      letterSpacing: -0.3,
                    }}
                  >
                    {t("home.modes.casual")}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Nunito_400Regular",
                      color: "rgba(255,255,255,0.85)",
                      marginTop: 3,
                    }}
                    numberOfLines={1}
                  >
                    {t("home.modes.casualDesc")}
                  </Text>
                </View>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: "rgba(255,255,255,0.22)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 17,
                      color: "#FFFFFF",
                      fontFamily: "Fredoka_700Bold",
                    }}
                  >
                    →
                  </Text>
                </View>
              </View>
            </Gradient>
          </Pressable>
        </Animated.View>

        {/* Secondary modes — 2 columns */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
          {/* Solo */}
          <Animated.View
            entering={FadeInDown.delay(150).duration(400)}
            style={{ flex: 1 }}
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/mode/solo");
              }}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <View
                style={{
                  backgroundColor: colors.surfaceContainer,
                  borderRadius: 18,
                  paddingVertical: 20,
                  paddingHorizontal: 16,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: colors.primaryContainerBg,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>🎮</Text>
                </View>
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: "Fredoka_700Bold",
                    color: colors.onSurface,
                  }}
                >
                  {t("home.modes.solo")}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "Nunito_400Regular",
                    color: colors.onSurfaceMuted,
                    marginTop: 2,
                    lineHeight: 13,
                  }}
                  numberOfLines={2}
                >
                  {t("home.modes.soloDesc")}
                </Text>
                <View
                  style={{
                    alignSelf: "flex-start",
                    marginTop: 8,
                    backgroundColor: colors.primaryContainerBg,
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9,
                      fontFamily: "Nunito_700Bold",
                      letterSpacing: 0.5,
                      color: colors.primaryContainer,
                    }}
                  >
                    SOLO
                  </Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>

          {/* Ranked — disabled */}
          <Animated.View
            entering={FadeInDown.delay(250).duration(400)}
            style={{ flex: 1 }}
          >
            <View
              style={{
                backgroundColor: colors.surfaceContainer,
                borderRadius: 18,
                paddingVertical: 20,
                paddingHorizontal: 16,
                opacity: 0.55,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: colors.p2Bg,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 22 }}>🏆</Text>
              </View>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Fredoka_700Bold",
                  color: colors.onSurface,
                }}
              >
                {t("home.modes.ranked")}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Nunito_400Regular",
                  color: colors.onSurfaceMuted,
                  marginTop: 2,
                  lineHeight: 13,
                }}
                numberOfLines={2}
              >
                {t("home.modes.rankedDesc")}
              </Text>
              <View
                style={{
                  alignSelf: "flex-start",
                  marginTop: 8,
                  backgroundColor: colors.onSurfaceMuted,
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    fontFamily: "Nunito_700Bold",
                    letterSpacing: 0.5,
                    color: "#FFFFFF",
                  }}
                >
                  BIENTÔT
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* My stats */}
        <Label text={t("home.myStats")} style={{ marginBottom: 10 }} />
        <StatsRow />

        {/* Cross-promo */}
        <View style={{ marginTop: 24 }}>
          <MitsitsyCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
