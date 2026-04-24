import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";

interface Achievement {
  id: string;
  emoji: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export default function AchievementsScreen() {
  const { colors } = useTheme();
  const { stats, level } = usePlayerStats();

  const achievements: Achievement[] = [
    { id: "first-win", emoji: "🥇", title: "Première victoire", description: "Gagne ta première partie", unlocked: stats.gamesWon >= 1 },
    { id: "ten-games", emoji: "🎮", title: "Joueur régulier", description: "Joue 10 parties", unlocked: stats.gamesPlayed >= 10 },
    { id: "streak-3", emoji: "🔥", title: "En feu", description: "Gagne 3 fois d'affilée", unlocked: stats.bestStreak >= 3 },
    { id: "streak-5", emoji: "⚡", title: "Imbattable", description: "Gagne 5 fois d'affilée", unlocked: stats.bestStreak >= 5 },
    { id: "level-5", emoji: "⭐", title: "Niveau 5", description: "Atteins le niveau 5", unlocked: level >= 5 },
    { id: "level-10", emoji: "🌟", title: "Niveau 10", description: "Atteins le niveau 10", unlocked: level >= 10 },
    { id: "100-games", emoji: "💯", title: "Centenaire", description: "Joue 100 parties", unlocked: stats.gamesPlayed >= 100 },
    { id: "500-points", emoji: "💎", title: "Collectionneur", description: "Gagne 500 XP au total", unlocked: stats.points >= 500 },
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
            Succès
          </Text>
          <Text style={{ fontSize: 13, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginTop: 2 }}>
            {unlockedCount} / {achievements.length} débloqués
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
                  {a.title}
                </Text>
                <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginTop: 1 }}>
                  {a.description}
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
            Plus de succès bientôt
          </Text>
          <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.onSurfaceMuted, marginTop: 4, textAlign: "center" }}>
            De nouveaux défis arrivent dans les prochaines mises à jour
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
