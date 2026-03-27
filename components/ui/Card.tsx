import { View, ViewStyle } from "react-native";
import { radii } from "./theme";
import { useTheme } from "../../lib/ThemeContext";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/** Surface container card — white bg, ambient shadow, no borders (No-Line rule) */
export function Card({ children, style }: CardProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surfaceContainer,
          borderRadius: radii.md,
          paddingVertical: 20,
          paddingHorizontal: 20,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
