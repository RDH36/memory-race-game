import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";

interface ModeStatsStripProps {
  stats: { value: string; label: string }[];
}

export function ModeStatsStrip({ stats }: ModeStatsStripProps) {
  const { colors } = useTheme();

  return (
    <Animated.View entering={FadeInDown.delay(80).duration(400)}>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              backgroundColor: colors.surfaceContainer,
              borderRadius: 14,
              paddingVertical: 12,
              paddingHorizontal: 10,
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 18, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}
            >
              {s.value}
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Nunito_700Bold",
                color: colors.onSurfaceMuted,
                marginTop: 2,
              }}
            >
              {s.label}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}
