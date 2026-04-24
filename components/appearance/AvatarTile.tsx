import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { AvatarSkin } from "../../lib/skins";

interface Props {
  avatar: AvatarSkin & { unlocked: boolean };
  size?: number;
  /** Selection ring color — null/undefined = no ring */
  ring?: string | null;
  /** Show lock overlay when avatar is locked */
  showLock?: boolean;
}

/**
 * Round avatar tile — pastel hue background + emoji centered.
 * Locked: emoji visible (slightly faded) + small gold lock badge in the corner
 * so users can preview what they'd unlock.
 */
export function AvatarTile({ avatar, size = 44, ring, showLock = true }: Props) {
  const bg = avatar.neutral ? "#F0EAE6" : `hsl(${avatar.hue}, 60%, 88%)`;
  const ringWidth = ring ? 3 : 0;
  const outerSize = size + ringWidth * 2;
  const emojiSize = size * 0.6;
  const isLocked = showLock && !avatar.unlocked;
  const lockBadgeSize = Math.max(14, size * 0.32);

  return (
    <View
      style={{
        width: outerSize,
        height: outerSize,
        borderRadius: outerSize / 2,
        backgroundColor: ring ?? "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          overflow: "visible",
        }}
      >
        <Text
          style={{
            fontSize: emojiSize,
            lineHeight: emojiSize * 1.18,
            opacity: isLocked ? 0.7 : 1,
          }}
        >
          {avatar.emoji}
        </Text>
        {isLocked && (
          <View
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: lockBadgeSize,
              height: lockBadgeSize,
              borderRadius: lockBadgeSize / 2,
              backgroundColor: "#FFD366",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: "#FFFFFF",
            }}
          >
            <Ionicons name="lock-closed" size={lockBadgeSize * 0.55} color="#1A1C17" />
          </View>
        )}
      </View>
    </View>
  );
}
