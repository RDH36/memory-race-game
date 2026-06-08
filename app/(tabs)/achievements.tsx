import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { Panel, Rise } from "@/components/ui/arcade";
import {
  ACHIEVEMENT_DEFINITIONS,
  computeUnlockedAchievementIds,
} from "../../lib/achievements";

export default function AchievementsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { stats, level } = usePlayerStats();

  const unlockedSet = new Set(computeUnlockedAchievementIds(stats, level));
  const achievements = ACHIEVEMENT_DEFINITIONS.map((def) => ({
    id: def.id,
    emoji: def.emoji,
    unlocked: unlockedSet.has(def.id),
  }));

  const unlockedCount = unlockedSet.size;

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

        <View style={{ gap: 11 }}>
          {achievements.map((a, i) => (
            <Rise key={a.id} delay={i * 45}>
              <View style={{ opacity: a.unlocked ? 1 : 0.5 }}>
                <Panel
                  style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 16 }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: a.unlocked ? colors.hues.violet[2] : colors.surfaceContainerLow,
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: a.unlocked ? `0 3px 0 ${colors.hues.violet[1]}33` : undefined,
                    }}
                  >
                    <Text style={{ fontSize: 26 }}>{a.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
                      {t(`achievements.items.${a.id}.title`)}
                    </Text>
                    <Text style={{ fontSize: 12, fontFamily: "Fredoka_700Bold", color: colors.onSurfaceMuted, marginTop: 1 }}>
                      {t(`achievements.items.${a.id}.description`)}
                    </Text>
                  </View>
                  {a.unlocked ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                  ) : (
                    <Ionicons name="lock-closed" size={18} color={colors.onSurfaceMuted} />
                  )}
                </Panel>
              </View>
            </Rise>
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
