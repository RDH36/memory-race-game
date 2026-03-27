import { Text, TextStyle } from "react-native";
import { useTheme } from "../../lib/ThemeContext";

interface LabelProps {
  text: string;
  style?: TextStyle;
}

/** Uppercase section label — editorial style (CHOISIR UN MODE, MES STATS…) */
export function Label({ text, style }: LabelProps) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        {
          fontSize: 11,
          fontWeight: "700",
          fontFamily: "Nunito_700Bold",
          color: colors.onSurfaceVariant,
          letterSpacing: 1,
          textTransform: "uppercase",
          marginBottom: 12,
        },
        style,
      ]}
    >
      {text}
    </Text>
  );
}
