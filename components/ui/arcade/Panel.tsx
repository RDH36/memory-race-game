// Panel — white card with a soft 3D depth (bottom lip + ambient
// shadow). The base surface for every arcade screen section.
import React from "react";
import {
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "@/lib/ThemeContext";
import { haptics } from "@/lib/haptics";

export type PanelProps = {
  children?: React.ReactNode;
  /** Override the surface color (e.g. a soft hue tint). */
  background?: string;
  radius?: number;
  /** Adds a faint inner stroke for extra crispness. */
  stroke?: boolean;
  onPress?: () => void;
  haptic?: "tap" | "select" | "none";
  style?: StyleProp<ViewStyle>;
};

export function Panel({
  children,
  background,
  radius = 22,
  stroke = false,
  onPress,
  haptic = "tap",
  style,
}: PanelProps) {
  const { colors, isDark } = useTheme();

  const body = (pressed: boolean): StyleProp<ViewStyle> => [
    {
      backgroundColor: background ?? colors.surfaceContainer,
      borderRadius: radius,
      // ambient depth — supported on RN new arch; degrades to flat.
      boxShadow: `0 3px 0 ${colors.panelLip}, 0 12px 26px -12px ${colors.panelShadow}`,
      borderWidth: stroke ? 2 : 0,
      borderColor: stroke ? (isDark ? "rgba(255,255,255,0.06)" : "#F1ECFB") : "transparent",
      // Always provide a valid transform array — RN's processTransform calls
      // `.forEach` on it, and a null/undefined transform (from prop diffing on
      // a removed key) crashes with "forEach of null".
      transform: [{ scale: onPress && pressed ? 0.97 : 1 }],
    } as ViewStyle,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={() => {
          if (haptic !== "none") haptics[haptic]();
          onPress();
        }}
      >
        {({ pressed }) => <View style={body(pressed)}>{children}</View>}
      </Pressable>
    );
  }
  return <View style={body(false)}>{children}</View>;
}
