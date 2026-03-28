import { Text, View } from "react-native";
import { TabKey } from "./TabBar";

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  wins: number;
  gamesPlayed: number;
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

export function getWinRate(entry: LeaderboardEntry) {
  return entry.gamesPlayed > 0
    ? Math.round((entry.wins / entry.gamesPlayed) * 100)
    : 0;
}

export function LeaderboardRow({
  item,
  rank,
  activeTab,
  colors,
  isDark,
  t,
}: {
  item: LeaderboardEntry;
  rank: number;
  activeTab: TabKey;
  colors: any;
  isDark: boolean;
  t: any;
}) {
  const level = computeLevel(item.xp);
  const isPodium = rank <= 3;
  const winRate = getWinRate(item);

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
            fontFamily: item.isCurrentUser
              ? "Fredoka_700Bold"
              : "Nunito_600SemiBold",
            color: item.isCurrentUser
              ? colors.primaryContainer
              : colors.onSurface,
          }}
        >
          {item.name}
        </Text>
        <Text
          style={{
            fontSize: 11,
            fontFamily: "Nunito_400Regular",
            color: colors.onSurfaceVariant,
            marginTop: 1,
          }}
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
        {activeTab === "winRate"
          ? t("leaderboard.winRateValue", { value: winRate })
          : `${item.xp.toLocaleString()} ${t("leaderboard.xp")}`}
      </Text>
    </View>
  );
}
