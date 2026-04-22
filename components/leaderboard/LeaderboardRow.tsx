import { Pressable, Text, View } from "react-native";

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  wins: number;
  gamesPlayed: number;
  isCurrentUser?: boolean;
  isBot?: boolean;
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

const PODIUM_COLORS: Record<number, { border: string; bg: string; bgDark: string; accent: string }> = {
  1: { border: "#F5C542", bg: "#FFF7DC", bgDark: "#3A2E10", accent: "#B8860B" },
  2: { border: "#C0C6CE", bg: "#F3F5F8", bgDark: "#2C2F33", accent: "#7A828C" },
  3: { border: "#D48A5A", bg: "#FDEEE2", bgDark: "#3A2618", accent: "#8A4A1F" },
};

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
  const podium = isPodium ? PODIUM_COLORS[rank] : null;

  const baseBackground = item.isCurrentUser
    ? colors.primaryContainerBg
    : colors.surfaceContainer;
  const background = podium
    ? isDark
      ? podium.bgDark
      : podium.bg
    : baseBackground;

  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: podium ? 16 : 12,
          paddingHorizontal: 16,
          marginHorizontal: 20,
          marginBottom: podium ? 10 : 6,
          borderRadius: 16,
          backgroundColor: background,
          borderWidth: podium ? 1.5 : 0,
          borderColor: podium?.border,
        }}
      >
        <View style={{ width: podium ? 36 : 32, alignItems: "center" }}>
          {podium ? (
            <Text style={{ fontSize: 24 }}>
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
            width: podium ? 44 : 36,
            height: podium ? 44 : 36,
            borderRadius: podium ? 22 : 18,
            backgroundColor: item.isCurrentUser
              ? colors.primaryContainer + "22"
              : isDark
                ? "#2A2A2A"
                : "#F0ECEC",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 8,
            borderWidth: podium ? 2 : 0,
            borderColor: podium?.border,
          }}
        >
          <Text style={{ fontSize: podium ? 22 : 18 }}>{item.avatar}</Text>
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              fontSize: podium ? 16 : 14,
              fontFamily: podium || item.isCurrentUser
                ? "Fredoka_700Bold"
                : "Nunito_600SemiBold",
              color: podium
                ? podium.accent
                : item.isCurrentUser
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
            {level}
          </Text>
        </View>

        <Text
          style={{
            fontSize: podium ? 15 : 14,
            fontFamily: "Nunito_700Bold",
            color: podium
              ? podium.accent
              : item.isCurrentUser
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
