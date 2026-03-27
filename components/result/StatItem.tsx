import { View, Text } from "react-native";
import { Card } from "../ui/Card";
import { useTheme } from "../../lib/ThemeContext";

interface StatItemProps {
  value: string;
  label: string;
}

export function StatItem({ value, label }: StatItemProps) {
  const { colors } = useTheme();
  return (
    <Card style={{ flex: 1, alignItems: "flex-start", paddingVertical: 14, paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 20, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
        {value}
      </Text>
      <Text
        style={{
          fontSize: 11,
          fontFamily: "Nunito_400Regular",
          color: colors.onSurfaceVariant,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </Card>
  );
}
