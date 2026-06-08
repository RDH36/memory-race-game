import { Text, View } from "react-native";
import { useTheme } from "@/lib/ThemeContext";
import { Panel, Rise } from "@/components/ui/arcade";

export function ModeStatsArcade({
  stats,
}: {
  stats: { value: string; label: string }[];
}) {
  const { colors } = useTheme();
  return (
    <Rise delay={80}>
      <View style={{ flexDirection: "row", gap: 11, marginBottom: 22 }}>
        {stats.map((s, i) => (
          <Panel key={i} style={{ flex: 1, paddingVertical: 13, paddingHorizontal: 6, alignItems: "center" }}>
            <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 20, color: colors.onSurface }}>
              {s.value}
            </Text>
            <Text
              style={{
                fontFamily: "Fredoka_700Bold",
                fontSize: 10.5,
                color: colors.onSurfaceMuted,
                marginTop: 2,
              }}
            >
              {s.label}
            </Text>
          </Panel>
        ))}
      </View>
    </Rise>
  );
}
