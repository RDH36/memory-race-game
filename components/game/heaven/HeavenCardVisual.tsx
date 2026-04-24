import { Text, View } from "react-native";
import { HEAVEN_THEME } from "../../../lib/skins";
import { CelticCross } from "./CelticCross";

export type HeavenCardState = "back" | "face" | "matched";

interface Props {
  state: HeavenCardState;
  emoji?: string;
  player?: 1 | 2;
  size?: number;
  fillParent?: boolean;
}

const t = HEAVEN_THEME;

/**
 * Heaven card visual — ivory + gold antique, symmetric (no rotation).
 * Back: gold border + inner gold ring + CelticCross centered.
 * Face/matched: light ivory + emoji + gold border.
 */
export function HeavenCardVisual({ state, emoji, player = 1, size, fillParent }: Props) {
  const dims = fillParent ? { flex: 1, aspectRatio: 1 } : { width: size, height: size };
  const radius = (size ?? 64) * 0.18; // rounder than Inferno's 0.06

  if (state === "back") {
    return (
      <View
        style={{
          ...dims,
          borderRadius: radius,
          borderWidth: 1.2,
          borderColor: t.gold,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: t.back,
        }}
      >
        {/* Inner gold ring */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: "8%", left: "8%", right: "8%", bottom: "8%",
            borderWidth: 0.8,
            borderColor: t.haloBright,
            borderRadius: radius * 0.7,
          }}
        />
        <CelticCross size={(size ?? 64) * 0.51} color={t.haloDeep} accent={t.gold} />
      </View>
    );
  }

  const isMatched = state === "matched";
  const baseBg = isMatched ? (player === 1 ? t.matchedP1 : t.matchedP2) : t.face;
  const borderColor = isMatched
    ? (player === 1 ? t.matchedP1Border : t.matchedP2Border)
    : t.gold + "88";

  return (
    <View
      style={{
        ...dims,
        borderRadius: radius,
        borderWidth: 1,
        borderColor,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: baseBg,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: "8%", left: "8%", right: "8%", bottom: "8%",
          borderWidth: 0.6,
          borderColor: t.gold + "66",
          borderRadius: radius * 0.7,
        }}
      />
      <Text style={{ fontSize: (size ?? 64) * 0.5, lineHeight: (size ?? 64) * 0.6 }}>
        {emoji}
      </Text>
    </View>
  );
}
