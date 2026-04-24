import { Text, View } from "react-native";
import { ROYAL_THEME } from "../../../lib/skins";
import { RoyalSealIcon } from "./RoyalSealIcon";

export type RoyalCardState = "back" | "face" | "matched";

interface Props {
  state: RoyalCardState;
  emoji?: string;
  player?: 1 | 2;
  size?: number;
  fillParent?: boolean;
}

const t = ROYAL_THEME;

/**
 * Royal-themed playing card visual. Lean rendering: solid colors instead of
 * SVG gradients (perf), one SVG (the seal) on back, zero SVGs on face/matched.
 */
export function RoyalCardVisual({
  state, emoji, player = 1, size, fillParent,
}: Props) {
  const dims = fillParent ? { flex: 1, aspectRatio: 1 } : { width: size, height: size };
  const radius = (size ?? 64) * 0.11;

  if (state === "back") {
    return (
      <View
        style={{
          ...dims,
          borderRadius: radius,
          borderWidth: 1.5,
          borderColor: t.goldDeep,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: t.back,
        }}
      >
        {/* Inner gold frame */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: "8%", left: "8%", right: "8%", bottom: "8%",
            borderWidth: 0.8,
            borderColor: t.gold,
            borderRadius: radius * 0.7,
          }}
        />
        <RoyalSealIcon size={(size ?? 64) * 0.55} color={t.gold} accent={t.goldBright} />
      </View>
    );
  }

  // face / matched — pure View, zero SVGs
  const isMatched = state === "matched";
  const baseBg = isMatched ? (player === 1 ? t.matchedP1 : t.matchedP2) : t.face;
  const borderColor = isMatched
    ? (player === 1 ? t.matchedP1Border : t.matchedP2Border)
    : t.goldDeep;

  return (
    <View
      style={{
        ...dims,
        borderRadius: radius,
        borderWidth: 1.5,
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
          borderWidth: 0.8,
          borderColor: t.gold + "88",
          borderRadius: radius * 0.7,
        }}
      />
      <Text style={{ fontSize: (size ?? 64) * 0.5, lineHeight: (size ?? 64) * 0.6 }}>
        {emoji}
      </Text>
    </View>
  );
}
