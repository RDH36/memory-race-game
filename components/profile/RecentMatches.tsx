import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { Label } from "../ui/Label";
import { MatchRow } from "../history/MatchRow";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { useMatchHistory, type MatchEntry } from "../../lib/matchHistory";
import type { StatsTab } from "./ProfileStats";

function filterByTab(matches: MatchEntry[], tab: StatsTab): MatchEntry[] {
  if (tab === "vsAi") return matches.filter((m) => m.player2Type === "cpu");
  if (tab === "vsFriends") return matches.filter((m) => m.player2Type === "human");
  return matches;
}

export function RecentMatches({ tab = "global" }: { tab?: StatsTab }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { userId } = usePlayerStats();
  const { matches, isLoading } = useMatchHistory(userId);

  const filtered = useMemo(() => filterByTab(matches, tab).slice(0, 3), [matches, tab]);

  if (isLoading) return null;
  if (filtered.length === 0) return null;

  return (
    <View style={{ marginTop: 24 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Label text={t("history.recent")} style={{ marginBottom: 0 }} />
        <Pressable
          onPress={() => router.push("/history")}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Nunito_700Bold",
              color: colors.primaryContainer,
              letterSpacing: 0.3,
            }}
          >
            {t("history.viewAll")} →
          </Text>
        </Pressable>
      </View>

      <View style={{ gap: 10 }}>
        {filtered.map((match) => (
          <MatchRow key={match.id} match={match} />
        ))}
      </View>
    </View>
  );
}
