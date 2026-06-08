import { Text, View } from "react-native";
import { useTheme } from "@/lib/ThemeContext";
import type { HueName } from "@/components/ui/theme";
import { Drop } from "@/components/ui/arcade";

/** Solid-color mode banner with a chunky icon tile (no gradient). */
export function ModeHeroArcade({
  icon,
  title,
  subtitle,
  color = "violet",
}: {
  icon: string;
  title: string;
  subtitle: string;
  color?: HueName;
}) {
  const { colors } = useTheme();
  const [c, cd] = colors.hues[color];

  return (
    <Drop style={{ marginBottom: 18 }}>
      <View
        style={{
          overflow: "hidden",
          borderRadius: 24,
          padding: 18,
          backgroundColor: c,
          boxShadow: `0 5px 0 ${cd}, 0 18px 30px -12px ${c}A6`,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
        }}
      >
        {/* deco card */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: -10,
            bottom: -16,
            width: 56,
            height: 74,
            borderRadius: 12,
            backgroundColor: "rgba(255,255,255,0.12)",
            transform: [{ rotate: "16deg" }],
          }}
        />
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.22)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 30 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 22, color: "#fff" }}>
            {title}
          </Text>
          <Text
            style={{
              fontFamily: "Fredoka_700Bold",
              fontSize: 12,
              color: "rgba(255,255,255,0.85)",
              marginTop: 2,
            }}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        </View>
      </View>
    </Drop>
  );
}
