import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import { usePlayerStats } from "@/lib/playerStats";
import { Panel, SectionTitle } from "@/components/ui/arcade";

function Stat({ icon, value, label }: { icon: string; value: number | string; label: string }) {
  const { colors } = useTheme();
  return (
    <Panel style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 8, alignItems: "center" }}>
      <Text style={{ fontSize: 22, marginBottom: 5 }}>{icon}</Text>
      <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 21, color: colors.onSurface }}>
        {value}
      </Text>
      <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 10.5, color: colors.onSurfaceMuted }}>
        {label}
      </Text>
    </Panel>
  );
}

export function HomeStats() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { stats } = usePlayerStats();
  const [blue] = colors.hues.blue;

  return (
    <View>
      <SectionTitle>{t("home.myStats")}</SectionTitle>
      <View style={{ flexDirection: "row", gap: 11, marginBottom: 22 }}>
        <Stat icon="🎲" value={stats.gamesPlayed} label={t("home.statGames")} />
        <Stat icon="🏅" value={stats.gamesWon} label={t("home.statWins")} />
        <Stat icon="🔥" value={stats.currentStreak} label={t("home.statStreak")} />
      </View>

      <Panel
        onPress={() => router.push("/leaderboard")}
        background={colors.hues.blue[2]}
        style={{ flexDirection: "row", alignItems: "center", gap: 13, padding: 14 }}
      >
        <Text style={{ fontSize: 30 }}>🏆</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 15, color: colors.onSurface }}>
            {t("home.leaderboardTitle")}
          </Text>
          <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 11.5, color: colors.onSurfaceMuted }}>
            {t("home.leaderboardSub")}
          </Text>
        </View>
        <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 20, color: blue }}>›</Text>
      </Panel>
    </View>
  );
}
