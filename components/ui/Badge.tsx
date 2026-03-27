import { Text, View, ViewStyle } from "react-native";
import { radii } from "./theme";

interface BadgeProps {
  text: string;
  color: string;
  style?: ViewStyle;
}

/** Small colored badge — text + tinted background at 8% opacity */
export function Badge({ text, color, style }: BadgeProps) {
  return (
    <View
      style={[
        {
          backgroundColor: color + "14",
          paddingHorizontal: 10,
          paddingVertical: 3,
          borderRadius: radii.sm - 2,
          alignSelf: "flex-start",
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 10,
          fontFamily: "Nunito_700Bold",
          color,
          letterSpacing: 0.5,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
