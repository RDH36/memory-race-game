import { Pressable, Text, View } from "react-native";

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

export function LeaderboardRow({
  item,
  rank,
  colors,
  isDark,
  t,
  onPress,
}: {
  item: LeaderboardEntry;
  rank: number;
  colors: any;
  isDark: boolean;
  t: any;
  onPress?: () => void;
}) {
  const level = computeLevel(item.xp);
  const isPodium = rank <= 3;

  return (
    <Pressable onPress={onPress}>
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
          {`${item.xp.toLocaleString()} ${t("leaderboard.xp")}`}
        </Text>
      </View>
    </Pressable>
  );
}
