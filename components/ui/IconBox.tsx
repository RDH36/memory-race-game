import { Text, View, ViewStyle } from "react-native";
import { radii } from "./theme";
import { useTheme } from "../../lib/ThemeContext";

interface IconBoxProps {
  emoji: string;
  size?: number;
  bg?: string;
  style?: ViewStyle;
}

/** Rounded square container for emoji icons */
export function IconBox({
  emoji,
  size = 48,
  bg,
  style,
}: IconBoxProps) {
  const { colors } = useTheme();
  const bgColor = bg ?? colors.surface;
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radii.md,
          backgroundColor: bgColor,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
}
