import { useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { LoadingCard } from "../../components/ui/LoadingCard";
import { db } from "../../lib/instant";
import { TabBar, TabKey } from "../../components/leaderboard/TabBar";
import {
  LeaderboardEntry,
  LeaderboardRow,
} from "../../components/leaderboard/LeaderboardRow";

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { stats, avatar, nickname, userId } = usePlayerStats();
  const [activeTab, setActiveTab] = useState<TabKey>("xp");

  const { data, isLoading } = db.useQuery({
    leaderboard: {
      $: { order: { serverCreatedAt: "desc" } },
    },
    profiles: {},
  });

  const entries: LeaderboardEntry[] = useMemo(() => {
    const profilesByUserId = new Map(
      (data?.profiles ?? []).map((p: any) => [p.userId, p]),
    );
    const mapped = (data?.leaderboard ?? []).map((entry: any) => {
      const isCurrent = entry.userId === userId;
      const profile = profilesByUserId.get(entry.userId);
      return {
        id: entry.userId,
        name: isCurrent
          ? nickname || t("leaderboard.you")
          : profile?.nickname || "???",
        avatar: isCurrent ? avatar : profile?.avatar || "🧠",
        xp: entry.points || 0,
        wins: entry.gamesWon || 0,
        gamesPlayed: entry.gamesPlayed || 0,
        isCurrentUser: isCurrent,
      };
    });

    return mapped.sort((a, b) => b.xp - a.xp).slice(0, 200);
  }, [data, userId, nickname, avatar, t]);

  const me: LeaderboardEntry = entries.find((e) => e.isCurrentUser) || {
    id: userId || "me",
    name: nickname || t("leaderboard.you"),
    avatar,
    xp: stats.points,
    wins: stats.gamesWon,
    gamesPlayed: stats.gamesPlayed,
    isCurrentUser: true,
  };

  const myRank =
    entries.findIndex((e) => e.isCurrentUser) + 1 || entries.length + 1;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.surface }}
      edges={["top"]}
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 16, marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 28,
            fontFamily: "Fredoka_700Bold",
            color: colors.onSurface,
          }}
        >
          {t("leaderboard.title")}
        </Text>
      </View>

      <TabBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        colors={colors}
        isDark={isDark}
        t={t}
      />

      {isLoading ? (
        <LoadingCard />
      ) : entries.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 40,
          }}
        >
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🏆</Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Nunito_600SemiBold",
              color: colors.onSurfaceVariant,
              textAlign: "center",
            }}
          >
            {t("leaderboard.empty")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <LeaderboardRow
              item={item}
              rank={index + 1}
              colors={colors}
              isDark={isDark}
              t={t}
              onPress={() => {
                if (item.isCurrentUser) {
                  router.push("/(tabs)/profile");
                } else {
                  router.push(`/player/${item.id}`);
                }
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}

      {/* Fixed current user bar */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: isDark ? "#2A2A2A" : "#F0ECEC",
          backgroundColor: colors.surface,
          paddingVertical: 10,
        }}
      >
        <LeaderboardRow
          item={me}
          rank={myRank}
          colors={colors}
          isDark={isDark}
          t={t}
          onPress={() => router.push("/(tabs)/profile")}
        />
      </View>
    </SafeAreaView>
  );
}
