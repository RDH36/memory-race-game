import { useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { Label } from "../../components/ui/Label";
import { LoadingCard } from "../../components/ui/LoadingCard";
import { db } from "../../lib/instant";

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  wins: number;
  isCurrentUser?: boolean;
}

function computeLevel(xp: number) {
  let level = 1;
  let total = 0;
  while (true) {
    const needed = level * 75;
    if (xp < total + needed) return level;
    total += needed;
    level++;
  }
}

function Row({ item, rank, colors, isDark, t }: any) {
  const level = computeLevel(item.xp);
  const isPodium = rank <= 3;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 20,
        marginBottom: 6,
        borderRadius: 12,
        backgroundColor: item.isCurrentUser
          ? colors.primaryContainerBg
          : colors.surfaceContainer,
      }}
    >
      <View style={{ width: 32, alignItems: "center" }}>
        {isPodium ? (
          <Text style={{ fontSize: 18 }}>
            {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
          </Text>
        ) : (
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Nunito_700Bold",
              color: colors.onSurfaceVariant,
            }}
          >
            {rank}
          </Text>
        )}
      </View>

      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: item.isCurrentUser
            ? colors.primaryContainer + "22"
            : isDark
              ? "#2A2A2A"
              : "#F0ECEC",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: 8,
        }}
      >
        <Text style={{ fontSize: 18 }}>{item.avatar}</Text>
      </View>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: item.isCurrentUser ? "Fredoka_700Bold" : "Nunito_600SemiBold",
            color: item.isCurrentUser
              ? colors.primaryContainer
              : colors.onSurface,
          }}
        >
          {item.name}
        </Text>
        <Text
          style={{ fontSize: 11, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginTop: 1 }}
        >
          {t("leaderboard.level")}
          {level} · {item.wins} {t("leaderboard.wins")}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 14,
          fontFamily: "Nunito_700Bold",
          color: item.isCurrentUser
            ? colors.primaryContainer
            : colors.onSurface,
        }}
      >
        {item.xp.toLocaleString()} {t("leaderboard.xp")}
      </Text>
    </View>
  );
}

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { stats, avatar, nickname, userId } = usePlayerStats();

  // Query leaderboard + all profiles separately (link may not exist)
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
    return (data?.leaderboard ?? [])
      .map((entry: any) => {
        const isCurrent = entry.userId === userId;
        const profile = profilesByUserId.get(entry.userId);
        return {
          id: entry.userId,
          name: isCurrent ? (nickname || t("leaderboard.you")) : (profile?.nickname || "???"),
          avatar: isCurrent ? avatar : (profile?.avatar || "🧠"),
          xp: entry.points || 0,
          wins: entry.gamesWon || 0,
          isCurrentUser: isCurrent,
        };
      })
      .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.xp - a.xp);
  }, [data, userId, nickname, avatar, t]);

  const me: LeaderboardEntry = entries.find((e) => e.isCurrentUser) || {
    id: userId || "me",
    name: nickname || t("leaderboard.you"),
    avatar,
    xp: stats.points,
    wins: stats.gamesWon,
    isCurrentUser: true,
  };

  const myRank = entries.findIndex((e) => e.isCurrentUser) + 1 || entries.length + 1;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.surface }}
      edges={["top"]}
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 16, marginBottom: 16 }}>
        <Text
          style={{ fontSize: 28, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}
        >
          {t("leaderboard.title")}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <Label text={t("leaderboard.global")} />
      </View>

      {isLoading ? (
        <LoadingCard />
      ) : entries.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🏆</Text>
          <Text style={{ fontSize: 16, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant, textAlign: "center" }}>
            {t("leaderboard.empty")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Row
              item={item}
              rank={index + 1}
              colors={colors}
              isDark={isDark}
              t={t}
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
        <Row item={me} rank={myRank} colors={colors} isDark={isDark} t={t} />
      </View>
    </SafeAreaView>
  );
}
