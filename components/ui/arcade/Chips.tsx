// Chips — CoinBar (currency pill), Ribbon (badge), Stars (rating).
import React from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@/lib/ThemeContext";
import type { HueName } from "@/components/ui/theme";

export function CoinBar({
  icon,
  value,
  color = "gold",
}: {
  icon: string;
  value: number | string;
  color?: "gold" | "blue" | "violet";
}) {
  const { colors } = useTheme();
  const [, dark, bg] = colors.hues[color];
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        borderRadius: 999,
        paddingVertical: 5,
        paddingLeft: 8,
        paddingRight: 12,
        backgroundColor: bg,
        boxShadow: `inset 0 0 0 2px #FFFFFF99`,
      }}
    >
      <Text style={{ fontSize: 14 }}>{icon}</Text>
      <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 14, color: dark }}>
        {value}
      </Text>
    </View>
  );
}

export function Ribbon({
  children,
  color = "coral",
  style,
}: {
  children: React.ReactNode;
  color?: HueName;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const [c, cd] = colors.hues[color];
  return (
    <View
      style={[
        {
          alignSelf: "flex-start",
          backgroundColor: c,
          paddingVertical: 3,
          paddingHorizontal: 9,
          borderRadius: 8,
          boxShadow: `0 2px 0 ${cd}`,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: "Fredoka_700Bold",
          fontSize: 10,
          letterSpacing: 0.6,
          color: color === "white" || color === "gold" ? colors.onSurface : "#fff",
        }}
      >
        {children}
      </Text>
    </View>
  );
}

export function Stars({ n, max = 3, size = 16 }: { n: number; max?: number; size?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 3 }}>
      {Array.from({ length: max }, (_, i) => (
        <Text
          key={i}
          style={{ fontSize: size, opacity: i < n ? 1 : 0.32 }}
        >
          {i < n ? "⭐" : "☆"}
        </Text>
      ))}
    </View>
  );
}
