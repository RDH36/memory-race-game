import { Platform, Pressable, Text, View } from "react-native";
import { PremiumDecor } from "../appearance/PremiumDecor";

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
    ? colors.primary
    : colors.surfaceContainer;
  const background = podium
    ? isDark
      ? podium.bgDark
      : podium.bg
    : baseBackground;
  const nameColor = podium
    ? podium.accent
    : item.isCurrentUser
      ? "#fff"
      : colors.onSurface;
  const valueColor = podium
    ? podium.accent
    : item.isCurrentUser
      ? "#fff"
      : colors.primary;

  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: podium ? 16 : 12,
          paddingHorizontal: 16,
          marginHorizontal: 16,
          marginBottom: podium ? 11 : 7,
          borderRadius: 16,
          backgroundColor: background,
          borderWidth: podium ? 2 : 0,
          borderColor: podium?.border,
          boxShadow: `0 3px 0 ${item.isCurrentUser ? colors.hues.violet[1] : colors.panelLip}, 0 10px 22px -14px ${colors.panelShadow}`,
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
                fontSize: 15,
                fontFamily: "Fredoka_700Bold",
                color: item.isCurrentUser ? "rgba(255,255,255,0.85)" : colors.onSurfaceMuted,
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
            borderWidth: podium ? 2 : 1.5,
            borderColor: podium?.border ?? colors.ghostBorder,
          }}
        >
          <PremiumDecor
            emoji={item.avatar}
            size={podium ? 40 : 33}
            borderRadius={podium ? 20 : 16.5}
            animateAura={isPodium || item.isCurrentUser}
            auraInset
            clipAura
          />
          <Text
            style={{
              fontSize: podium ? 20 : 16,
              textAlign: "center",
              ...(Platform.OS === "android" && {
                includeFontPadding: false,
                textAlignVertical: "center",
              }),
            }}
          >
            {item.avatar}
          </Text>
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              fontSize: podium ? 16 : 15,
              fontFamily: "Fredoka_700Bold",
              color: nameColor,
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Fredoka_700Bold",
              color: item.isCurrentUser && !podium ? "rgba(255,255,255,0.8)" : colors.onSurfaceMuted,
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
            fontFamily: "Fredoka_700Bold",
            color: valueColor,
          }}
        >
          {`${item.xp.toLocaleString()} ${t("leaderboard.xp")}`}
        </Text>
      </View>
    </Pressable>
  );
}
