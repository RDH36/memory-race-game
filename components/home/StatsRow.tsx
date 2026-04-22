import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Card } from "../ui/Card";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";

function StatItem({ value, label, color }: { value: string; label: string; color: string }) {
  const { colors } = useTheme();
  return (
    <Card style={{ flex: 1, alignItems: "center", paddingVertical: 14, paddingHorizontal: 12 }}>
      <Text style={{ fontSize: 22, fontFamily: "Fredoka_700Bold", color }}>
        {value}
      </Text>
      <Text
        style={{ fontSize: 11, color: colors.onSurfaceVariant, marginTop: 4, fontFamily: "Nunito_600SemiBold" }}
      >
        {label}
      </Text>
    </Card>
  );
}

export function StatsRow() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { stats, winRate } = usePlayerStats();

  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      <StatItem
        value={stats.gamesPlayed > 0 ? `${winRate}%` : "—"}
        label={t("stats.winRate")}
        color={colors.success}
      />
      <StatItem
        value={stats.currentStreak > 0 ? `${stats.currentStreak} 🔥` : "0"}
        label={t("stats.streak")}
        color="#D4820A"
      />
      <StatItem
        value={`${stats.gamesPlayed}`}
        label={t("stats.games")}
        color={colors.primaryContainer}
      />
    </View>
  );
}
