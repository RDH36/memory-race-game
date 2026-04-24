import { Text, View } from "react-native";
import { INFERNO_THEME } from "../../../lib/skins";
import { GoeticSigil } from "./GoeticSigil";

export type InfernoCardState = "back" | "face" | "matched";

interface Props {
  state: InfernoCardState;
  emoji?: string;
  player?: 1 | 2;
  size?: number;
  fillParent?: boolean;
}

const t = INFERNO_THEME;

/**
 * Inferno card visual — solid colors + sigil on back. Cracks moved to the
 * board background (1 SVG total) for perf + better thematic feel.
 */
export function InfernoCardVisual({ state, emoji, player = 1, size, fillParent }: Props) {
  const dims = fillParent ? { flex: 1, aspectRatio: 1 } : { width: size, height: size };
  const radius = (size ?? 64) * 0.06;

  if (state === "back") {
    return (
      <View
        style={{
          ...dims,
          borderRadius: radius,
          borderWidth: 1,
          borderColor: t.ink,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: t.back,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: "8%", left: "8%", right: "8%", bottom: "8%",
            borderWidth: 0.6,
            borderColor: t.emberDeep,
            borderRadius: radius * 0.7,
          }}
        />
        <GoeticSigil size={(size ?? 64) * 0.58} color={t.ember} accent={t.emberBright} />
      </View>
    );
  }

  const isMatched = state === "matched";
  const baseBg = isMatched ? (player === 1 ? t.matchedP1 : t.matchedP2) : t.face;
  const borderColor = isMatched
    ? (player === 1 ? t.matchedP1Border : t.matchedP2Border)
    : t.emberDeep;

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
          borderColor: t.ash + "55",
          borderRadius: radius * 0.7,
        }}
      />
      <Text style={{ fontSize: (size ?? 64) * 0.5, lineHeight: (size ?? 64) * 0.6 }}>
        {emoji}
      </Text>
    </View>
  );
}
