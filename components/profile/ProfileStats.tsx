import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Card } from "../ui/Card";
import { Label } from "../ui/Label";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";

function StatCell({ value, label }: { value: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", paddingVertical: 10 }}>
      <Text style={{ fontSize: 22, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
        {value}
      </Text>
      <Text style={{ fontSize: 11, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginTop: 4 }}>
        {label}
      </Text>
    </View>
  );
}

export function ProfileStats() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { stats, winRate, rank, nextRank, rankProgress, pointsToNext } = usePlayerStats();

  return (
    <View style={{ gap: 20 }}>
      {/* Stats grid */}
      <View>
        <Label text={t("profile.statsTitle")} />
        <Card style={{ gap: 0, paddingVertical: 8, paddingHorizontal: 8 }}>
          <View style={{ flexDirection: "row" }}>
            <StatCell
              value={`${stats.gamesPlayed}`}
              label={t("profile.gamesPlayed")}
            />
            <StatCell
              value={stats.gamesPlayed > 0 ? `${winRate}%` : "—"}
              label={t("profile.winRate")}
            />
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: isDark ? "#2A2A2A" : "#F0ECEC",
              marginHorizontal: 8,
            }}
          />
          <View style={{ flexDirection: "row" }}>
            <StatCell
              value={`${stats.currentStreak} 🔥`}
              label={t("profile.currentStreak")}
            />
            <StatCell
              value={`${stats.bestStreak} 🔥`}
              label={t("profile.bestStreak")}
            />
          </View>
        </Card>
      </View>

      {/* Rank progress — coming soon */}
      <View style={{ opacity: 0.45 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Label text={t("profile.rankTitle")} style={{ marginBottom: 0 }} />
          <View
            style={{
              backgroundColor: colors.onSurfaceVariant,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            <Text style={{ fontSize: 9, fontFamily: "Nunito_700Bold", color: "#fff", letterSpacing: 0.3 }}>
              {t("settings.comingSoon").toUpperCase()}
            </Text>
          </View>
        </View>
        <Card style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontFamily: "Fredoka_600SemiBold", color: colors.onSurface }}>
              {t(`ranks.${rank}`)}
            </Text>
            <Text style={{ fontSize: 13, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant }}>
              {nextRank
                ? t("profile.nextRank", { rank: t(`ranks.${nextRank}`) })
                : t("profile.maxRank")}
            </Text>
          </View>

          <View style={{ height: 8, backgroundColor: isDark ? "#333" : "#E8E4E4", borderRadius: 4 }}>
            <View
              style={{
                width: `${Math.round(rankProgress * 100)}%`,
                height: 8,
                backgroundColor: colors.success,
                borderRadius: 4,
              }}
            />
          </View>
        </Card>
      </View>
    </View>
  );
}
