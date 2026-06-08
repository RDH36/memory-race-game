import { Text } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { Panel } from "@/components/ui/arcade";

interface StatItemProps {
  value: string;
  label: string;
}

export function StatItem({ value, label }: StatItemProps) {
  const { colors } = useTheme();
  return (
    <Panel style={{ flex: 1, alignItems: "center", paddingVertical: 14, paddingHorizontal: 8 }}>
      <Text style={{ fontSize: 19, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
        {value}
      </Text>
      <Text
        style={{
          fontSize: 10.5,
          fontFamily: "Fredoka_700Bold",
          color: colors.onSurfaceMuted,
          marginTop: 3,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Panel>
  );
}
