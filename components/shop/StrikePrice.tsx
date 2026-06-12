// Crossed-out pre-discount price — a bold coral slash over the old price,
// far more readable than a thin grey line-through.
import { Text, View } from "react-native";

export function StrikePrice({
  value,
  size = 13,
  color = "#8E87B8",
}: {
  /** Formatted old price; renders an invisible placeholder when null. */
  value: string | null;
  size?: number;
  color?: string;
}) {
  return (
    <View style={{ alignSelf: "center", opacity: value ? 1 : 0 }}>
      <Text
        numberOfLines={1}
        style={{ fontFamily: "Fredoka_700Bold", fontSize: size, color }}
      >
        {value ?? " "}
      </Text>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: -3,
          right: -3,
          top: "50%",
          height: 2.5,
          borderRadius: 2,
          backgroundColor: "#F05A5A",
          transform: [{ rotate: "-8deg" }],
        }}
      />
    </View>
  );
}
