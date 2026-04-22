import { Pressable, Text, View } from "react-native";
import { LeaderboardEntry } from "./LeaderboardRow";

const MEDAL_COLORS: Record<number, string> = {
  1: "#E7B547",
  2: "#B8BCC2",
  3: "#C98759",
};

function PodiumColumn({
  entry,
  rank,
  colors,
  onPress,
}: {
  entry: LeaderboardEntry;
  rank: 1 | 2 | 3;
  colors: any;
  onPress?: () => void;
}) {
  const standHeight = rank === 1 ? 88 : rank === 2 ? 68 : 56;
  const avatarSize = rank === 1 ? 56 : 48;
  const medalColor = MEDAL_COLORS[rank];
  const isMe = entry.isCurrentUser;

  return (
    <View style={{ flex: rank === 1 ? 1.15 : 1, alignItems: "center" }}>
      {/* Avatar with crown for #1 */}
      <View style={{ position: "relative", marginBottom: 6, alignItems: "center" }}>
        {rank === 1 && (
          <Text style={{ position: "absolute", top: -20, fontSize: 20, zIndex: 1 }}>👑</Text>
        )}
        <View
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: 18,
            backgroundColor: colors.surfaceContainer,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: medalColor,
          }}
        >
          <Text style={{ fontSize: rank === 1 ? 28 : 24 }}>{entry.avatar}</Text>
        </View>
      </View>

      <Text
        numberOfLines={1}
        style={{
          fontSize: 12,
          fontFamily: "Fredoka_600SemiBold",
          color: isMe ? colors.primaryContainer : colors.onSurface,
          maxWidth: "100%",
        }}
      >
        {entry.name}
      </Text>
      <Text
        style={{
          fontSize: 11,
          fontFamily: "Nunito_700Bold",
          color: colors.onSurfaceVariant,
          marginTop: 1,
        }}
      >
        {entry.xp.toLocaleString()} XP
      </Text>

      {/* Stand */}
      <Pressable
        onPress={onPress}
        style={{
          marginTop: 8,
          width: "100%",
          height: standHeight,
          backgroundColor: colors.surfaceContainer,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          borderBottomLeftRadius: 6,
          borderBottomRightRadius: 6,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 26,
            fontFamily: "Fredoka_700Bold",
            color: medalColor,
            letterSpacing: -1,
          }}
        >
          {rank}
        </Text>
      </Pressable>
    </View>
  );
}

export function LeaderboardPodium({
  topThree,
  colors,
  onPressEntry,
}: {
  topThree: LeaderboardEntry[];
  colors: any;
  onPressEntry?: (entry: LeaderboardEntry) => void;
}) {
  if (topThree.length < 3) return null;

  // Order visually: rank 2 (left), rank 1 (center tallest), rank 3 (right)
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 10,
        paddingHorizontal: 20,
        marginBottom: 20,
        marginTop: 4,
      }}
    >
      <PodiumColumn
        entry={topThree[1]}
        rank={2}
        colors={colors}
        onPress={() => onPressEntry?.(topThree[1])}
      />
      <PodiumColumn
        entry={topThree[0]}
        rank={1}
        colors={colors}
        onPress={() => onPressEntry?.(topThree[0])}
      />
      <PodiumColumn
        entry={topThree[2]}
        rank={3}
        colors={colors}
        onPress={() => onPressEntry?.(topThree[2])}
      />
    </View>
  );
}
