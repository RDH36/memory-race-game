import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";

interface Achievement {
  id: string;
  emoji: string;
  unlocked: boolean;
}

export default function AchievementsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { stats, level, winRate } = usePlayerStats();

  const achievements: Achievement[] = [
    { id: "first-win", emoji: "🥇", unlocked: stats.gamesWon >= 1 },
    { id: "ten-games", emoji: "🎮", unlocked: stats.gamesPlayed >= 10 },
    { id: "wins-10", emoji: "🏆", unlocked: stats.gamesWon >= 10 },
    { id: "games-50", emoji: "🎯", unlocked: stats.gamesPlayed >= 50 },
    { id: "streak-3", emoji: "🔥", unlocked: stats.bestStreak >= 3 },
    { id: "wins-50", emoji: "👑", unlocked: stats.gamesWon >= 50 },
    { id: "100-games", emoji: "💯", unlocked: stats.gamesPlayed >= 100 },
    { id: "level-5", emoji: "⭐", unlocked: level >= 5 },
    { id: "streak-5", emoji: "⚡", unlocked: stats.bestStreak >= 5 },
    { id: "winrate-50", emoji: "♟️", unlocked: stats.gamesPlayed >= 20 && winRate >= 0.5 },
    { id: "500-points", emoji: "💎", unlocked: stats.points >= 500 },
    { id: "games-250", emoji: "🎖️", unlocked: stats.gamesPlayed >= 250 },
    { id: "level-10", emoji: "🌟", unlocked: level >= 10 },
    { id: "wins-100", emoji: "🏅", unlocked: stats.gamesWon >= 100 },
    { id: "streak-10", emoji: "🚀", unlocked: stats.bestStreak >= 10 },
    { id: "points-1000", emoji: "💰", unlocked: stats.points >= 1000 },
    { id: "level-15", emoji: "💫", unlocked: level >= 15 },
    { id: "level-20", emoji: "🧙", unlocked: level >= 20 },
    { id: "points-5000", emoji: "🏦", unlocked: stats.points >= 5000 },
    { id: "level-25", emoji: "👨‍🎓", unlocked: level >= 25 },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 28, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
            {t("achievements.title")}
          </Text>
          <Text style={{ fontSize: 13, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginTop: 2 }}>
            {t("achievements.unlockedCount", { unlocked: unlockedCount, total: achievements.length })}
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          {achievements.map((a) => (
            <View
              key={a.id}
              style={{
                flexDirection: "row", alignItems: "center", gap: 14,
                paddingVertical: 14, paddingHorizontal: 16,
                borderRadius: 16,
                backgroundColor: colors.surfaceContainer,
                opacity: a.unlocked ? 1 : 0.5,
              }}
            >
              <View
                style={{
                  width: 48, height: 48, borderRadius: 14,
                  backgroundColor: a.unlocked ? colors.primaryContainerBg : colors.surfaceContainerLow,
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 26 }}>{a.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
                  {t(`achievements.items.${a.id}.title`)}
                </Text>
                <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginTop: 1 }}>
                  {t(`achievements.items.${a.id}.description`)}
                </Text>
              </View>
              {a.unlocked ? (
                <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              ) : (
                <Ionicons name="lock-closed" size={18} color={colors.onSurfaceMuted} />
              )}
            </View>
          ))}
        </View>

        <View style={{ marginTop: 24, padding: 16, borderRadius: 16, backgroundColor: colors.surfaceContainerLow, alignItems: "center" }}>
          <Text style={{ fontSize: 13, fontFamily: "Nunito_700Bold", color: colors.onSurfaceVariant }}>
            {t("achievements.comingSoon.title")}
          </Text>
          <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.onSurfaceMuted, marginTop: 4, textAlign: "center" }}>
            {t("achievements.comingSoon.message")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
