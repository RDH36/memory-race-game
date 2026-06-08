// Avatar (chunky framed emoji), Mascot (NekoFlash the fox) and
// Bubble (speech bubble) — the personality pieces of the arcade UI.
import React from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@/lib/ThemeContext";
import type { HueName } from "@/components/ui/theme";

export function Avatar({
  emoji,
  size = 52,
  color = "violet",
  ring = true,
  style,
}: {
  emoji: string;
  size?: number;
  color?: HueName;
  ring?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const [c, cd] = colors.hues[color];
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size * 0.32,
          backgroundColor: colors.surfaceContainer,
          alignItems: "center",
          justifyContent: "center",
          boxShadow: ring
            ? `inset 0 0 0 3px ${c}, 0 4px 0 ${cd}`
            : `0 4px 0 ${colors.panelLip}`,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: size * 0.55 }}>{emoji}</Text>
    </View>
  );
}

export function Mascot({
  emoji = "🦊",
  size = 96,
  shadow = true,
  style,
}: {
  emoji?: string;
  size?: number;
  shadow?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ width: size, height: size * 1.05, alignItems: "center" }, style]}>
      <Text style={{ fontSize: size, lineHeight: size * 1.02, textAlign: "center" }}>
        {emoji}
      </Text>
      {shadow && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            width: size * 0.6,
            height: size * 0.12,
            borderRadius: 999,
            backgroundColor: "rgba(42,33,80,0.12)",
          }}
        />
      )}
    </View>
  );
}

export function Bubble({
  children,
  style,
  background,
  textColor,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  background?: string;
  textColor?: string;
}) {
  const { colors } = useTheme();
  const bg = background ?? colors.surfaceContainer;
  return (
    <View
      style={[
        {
          alignSelf: "flex-start",
          backgroundColor: bg,
          borderRadius: 16,
          paddingVertical: 10,
          paddingHorizontal: 14,
          boxShadow: `0 3px 0 ${colors.panelLip}, 0 8px 18px -8px ${colors.panelShadow}`,
        },
        style,
      ]}
    >
      <Text style={{ fontFamily: "Fredoka_600SemiBold", fontSize: 13, color: textColor ?? colors.onSurface }}>
        {children}
      </Text>
      {/* tail */}
      <View
        style={{
          position: "absolute",
          bottom: -6,
          left: 22,
          width: 14,
          height: 14,
          backgroundColor: bg,
          transform: [{ rotate: "45deg" }],
          borderRadius: 3,
        }}
      />
    </View>
  );
}
