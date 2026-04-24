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
 * Lock overlay = dark scrim + golden lock pastille (per design).
 */
export function AvatarTile({ avatar, size = 44, ring, showLock = true }: Props) {
  const bg = avatar.neutral ? "#F0EAE6" : `hsl(${avatar.hue}, 60%, 88%)`;
  const ringWidth = ring ? 3 : 0;
  const outerSize = size + ringWidth * 2;
  const emojiSize = size * 0.6;

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
          overflow: "hidden",
        }}
      >
        <Text style={{ fontSize: emojiSize, lineHeight: emojiSize * 1.18 }}>{avatar.emoji}</Text>
        {showLock && !avatar.unlocked && (
          <View
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(26, 28, 23, 0.55)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: size * 0.42,
                height: size * 0.42,
                borderRadius: size * 0.21,
                backgroundColor: "#FFD366",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="lock-closed" size={size * 0.22} color="#1A1C17" />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
