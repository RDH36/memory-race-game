import { useCallback, useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BotSelectCard } from "../../components/home/BotSelectCard";
import { Label } from "../../components/ui/Label";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { useGameModeStats } from "../../lib/gameModeStats";
import { useRewardedAd } from "../../hooks/useRewardedAd";

const BOT_DATA = [
  { key: "easy", name: "BabyBot", avatar: "🐣", color: "#1D9E75", pairs: 6, power: 1 },
  { key: "medium", name: "NekoFlash", avatar: "🦊", color: "#A2340A", pairs: 8, power: 2 },
  { key: "hard", name: "AlphaMemory", avatar: "🤖", color: "#534AB7", pairs: 12, power: 3 },
] as const;

export default function SoloModeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { userId } = usePlayerStats();
  const modeStats = useGameModeStats(userId);
  const [loading, setLoading] = useState<string | null>(null);
  const [xpBoost, setXpBoost] = useState(true);

  const onRewardEarned = useCallback(() => {}, []);
  const { isLoaded: rewardedLoaded, showAd: showRewardedAd } = useRewardedAd(onRewardEarned);

  const totalAi = modeStats ? modeStats.aiEasy.gamesPlayed + modeStats.aiMedium.gamesPlayed + modeStats.aiHard.gamesPlayed : 0;
  const totalAiWon = modeStats ? modeStats.aiEasy.gamesWon + modeStats.aiMedium.gamesWon + modeStats.aiHard.gamesWon : 0;
  const aiWinRate = totalAi > 0 ? Math.round((totalAiWon / totalAi) * 100) : 0;

  const handleSelectDifficulty = (difficulty: string) => {
    if (loading) return;
    setLoading(difficulty);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const shouldBoost = xpBoost && rewardedLoaded;

    const navigate = () => {
      setTimeout(() => {
        router.push({ pathname: "/game", params: { difficulty, mode: "solo", ...(shouldBoost && { xpBoost: "1" }) } });
        setLoading(null);
      }, 200);
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
              backgroundColor: "#534AB7",
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
              <Text style={{ fontSize: 30 }}>🎮</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontFamily: "Fredoka_700Bold", color: "#FFF" }}>
                {t("home.modes.solo")}
              </Text>
              <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: "rgba(255,255,255,0.7)", marginTop: 3 }}>
                {t("home.modes.soloDesc")}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Stats row */}
        <Animated.View entering={FadeInDown.delay(80).duration(400).springify().damping(14)}>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
            <View style={{ flex: 1, backgroundColor: isDark ? colors.surfaceContainerHigh : colors.surfaceContainer, borderRadius: 14, paddingVertical: 12, alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>{totalAi}</Text>
              <Text style={{ fontSize: 10, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant, marginTop: 2 }}>{t("stats.games")}</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: isDark ? colors.surfaceContainerHigh : colors.surfaceContainer, borderRadius: 14, paddingVertical: 12, alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>{totalAi > 0 ? `${aiWinRate}%` : "—"}</Text>
              <Text style={{ fontSize: 10, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant, marginTop: 2 }}>{t("stats.winRate")}</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: isDark ? colors.surfaceContainerHigh : colors.surfaceContainer, borderRadius: 14, paddingVertical: 12, alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>{totalAiWon}</Text>
              <Text style={{ fontSize: 10, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant, marginTop: 2 }}>🏆</Text>
            </View>
          </View>
        </Animated.View>

        {/* Difficulty selection */}
        <Label text={t("home.chooseDifficulty")} />
        <View style={{ gap: 12, marginBottom: 24 }}>
          {BOT_DATA.map((bot, index) => (
            <BotSelectCard
              key={bot.key}
              botKey={bot.key}
              name={bot.name}
              avatar={bot.avatar}
              color={bot.color}
              pairs={bot.pairs}
              power={bot.power}
              index={index}
              loading={loading}
              onPress={() => handleSelectDifficulty(bot.key)}
            />
          ))}
        </View>

        {/* XP Boost */}
        <Animated.View entering={FadeInDown.delay(300).duration(350).springify().damping(14)}>
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
