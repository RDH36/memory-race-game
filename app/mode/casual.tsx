import { useCallback, useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Label } from "../../components/ui/Label";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { useGameModeStats } from "../../lib/gameModeStats";
import { useRewardedAd } from "../../hooks/useRewardedAd";

const CASUAL_OPTIONS = [
  { key: "matchmaking", icon: "🎲", titleKey: "room.matchmaking", descKey: "room.matchmakingDesc", color: "#D4820A" },
  { key: "create", icon: "🏠", titleKey: "room.createRoom", descKey: "room.createDesc", color: "#1D9E75" },
  { key: "join", icon: "🔗", titleKey: "room.joinRoom", descKey: "room.joinDesc", color: "#534AB7" },
] as const;

const ROUTES = {
  matchmaking: "/room/matchmaking",
  create: "/room/create",
  join: "/room/join",
} as const;

export default function CasualModeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { userId } = usePlayerStats();
  const modeStats = useGameModeStats(userId);
  const [xpBoost, setXpBoost] = useState(true);

  const onRewardEarned = useCallback(() => {}, []);
  const { isLoaded: rewardedLoaded, showAd: showRewardedAd } = useRewardedAd(onRewardEarned);

  const friendsStats = modeStats?.friends;
  const gamesPlayed = friendsStats?.gamesPlayed ?? 0;
  const winRate = friendsStats?.winRate ?? 0;
  const gamesWon = friendsStats?.gamesWon ?? 0;

  const handleOptionPress = (key: "matchmaking" | "create" | "join") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const shouldBoost = xpBoost && rewardedLoaded;

    const navigate = () => {
      router.push({ pathname: ROUTES[key], params: shouldBoost ? { xpBoost: "1" } : {} });
    };

    if (shouldBoost) {
      showRewardedAd();
      setTimeout(navigate, 500);
    } else {
      navigate();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <Pressable onPress={() => router.back()} hitSlop={16}
          style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: colors.surfaceContainer, alignSelf: "flex-start", marginTop: 8, marginBottom: 20 }}
        >
          <Text style={{ fontSize: 18, color: colors.onSurfaceVariant, marginRight: 4 }}>←</Text>
          <Text style={{ fontSize: 14, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant }}>{t("game.menu")}</Text>
        </Pressable>

        {/* Hero banner */}
        <Animated.View entering={FadeInDown.duration(400).springify().damping(14)}>
          <View
            style={{
              backgroundColor: "#1D9E75",
              borderRadius: 20,
              paddingVertical: 24,
              paddingHorizontal: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 30 }}>🔥</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontFamily: "Fredoka_700Bold", color: "#FFF" }}>
                {t("home.modes.casual")}
              </Text>
              <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: "rgba(255,255,255,0.7)", marginTop: 3 }}>
                {t("home.modes.casualDesc")}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Stats row */}
        <Animated.View entering={FadeInDown.delay(80).duration(400).springify().damping(14)}>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
            <View style={{ flex: 1, backgroundColor: isDark ? colors.surfaceContainerHigh : colors.surfaceContainer, borderRadius: 14, paddingVertical: 12, alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>{gamesPlayed}</Text>
              <Text style={{ fontSize: 10, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant, marginTop: 2 }}>{t("stats.games")}</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: isDark ? colors.surfaceContainerHigh : colors.surfaceContainer, borderRadius: 14, paddingVertical: 12, alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>{gamesPlayed > 0 ? `${winRate}%` : "—"}</Text>
              <Text style={{ fontSize: 10, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant, marginTop: 2 }}>{t("stats.winRate")}</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: isDark ? colors.surfaceContainerHigh : colors.surfaceContainer, borderRadius: 14, paddingVertical: 12, alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>{gamesWon}</Text>
              <Text style={{ fontSize: 10, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant, marginTop: 2 }}>🏆</Text>
            </View>
          </View>
        </Animated.View>

        {/* Options */}
        <Label text={t("room.casualTitle")} />
        <View style={{ gap: 12, marginBottom: 24 }}>
          {CASUAL_OPTIONS.map((opt, index) => (
            <Animated.View key={opt.key} entering={FadeInDown.delay(160 + index * 80).duration(350).springify().damping(14)}>
              <Pressable
                onPress={() => handleOptionPress(opt.key)}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                })}
              >
                <View
                  style={{
                    backgroundColor: isDark ? colors.surfaceContainerHigh : colors.surfaceContainer,
                    borderRadius: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: opt.color,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 20,
                    gap: 14,
                  }}
                >
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: opt.color + "18",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 26 }}>{opt.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 17, fontFamily: "Fredoka_700Bold", color: opt.color }}>
                      {t(opt.titleKey)}
                    </Text>
                    <Text style={{ fontSize: 12, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant, marginTop: 3 }}>
                      {t(opt.descKey)}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: opt.color + "14",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 16, color: opt.color, fontFamily: "Fredoka_700Bold" }}>{">"}</Text>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* XP Boost */}
        <Animated.View entering={FadeInDown.delay(400).duration(350).springify().damping(14)}>
          <Pressable
            onPress={() => setXpBoost(!xpBoost)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              backgroundColor: xpBoost ? "#D4820A" + "18" : (isDark ? colors.surfaceContainerHigh : colors.surfaceContainer),
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: xpBoost ? "#D4820A" + "50" : "transparent",
              paddingVertical: 14,
              paddingHorizontal: 16,
            }}
          >
            <Text style={{ fontSize: 24 }}>🎬</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontFamily: "Fredoka_600SemiBold", color: colors.onSurface }}>
                {t("home.xpBoost")}
              </Text>
              <Text style={{ fontSize: 11, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginTop: 2 }}>
                {t("home.xpBoostDesc")}
              </Text>
            </View>
            <Switch
              value={xpBoost}
              onValueChange={setXpBoost}
              trackColor={{ false: isDark ? "#555" : "#D8D4D4", true: "#D4820A" + "80" }}
              thumbColor={xpBoost ? "#D4820A" : (isDark ? "#888" : "#F4F3F4")}
            />
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
