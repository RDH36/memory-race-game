import { Text, View, ViewStyle } from "react-native";

interface FaceProps {
  width?: number;
  symbol: string;
  color: string;
  bg?: string;
  rotate?: number;
  style?: ViewStyle;
}

/** Mini game card FACE — shows a symbol. Used as decorative preview on shop hero and packs. */
export function MiniCardFace({
  width = 40, symbol, color, bg = "#FFFFFF", rotate = 0, style,
}: FaceProps) {
  return (
    <View
      style={[
        {
          width,
          height: width * 1.4,
          borderRadius: 6,
          backgroundColor: bg,
          borderWidth: 1.5,
          borderColor: `${color}22`,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ rotate: `${rotate}deg` }],
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: "Fredoka_700Bold",
          fontSize: width * 0.5,
          color,
          lineHeight: width * 0.6,
        }}
      >
        {symbol}
      </Text>
    </View>
  );
}

interface BackProps {
  width?: number;
  bg?: string;
  pattern?: string;
  rotate?: number;
  style?: ViewStyle;
}

/** Mini card BACK — shows a decorative pattern. Used in premium hero cluster. */
export function MiniCardBack({
  width = 40, bg = "#534AB7", pattern = "#3B309E", rotate = 0, style,
}: BackProps) {
  return (
    <View
      style={[
        {
          width,
          height: width * 1.4,
          borderRadius: 6,
          backgroundColor: bg,
          overflow: "hidden",
          transform: [{ rotate: `${rotate}deg` }],
        },
        style,
      ]}
    >
      <View
        style={{
          position: "absolute",
          top: 3, left: 3, right: 3, bottom: 3,
          borderRadius: 4,
          borderWidth: 1.5,
          borderColor: pattern,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: width * 0.4, height: width * 0.4,
            borderRadius: width * 0.2,
            backgroundColor: pattern,
            opacity: 0.6,
          }}
        />
      </View>
    </View>
  );
}
