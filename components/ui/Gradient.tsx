import { ReactNode } from "react";
import { View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface GradientProps {
  colors: string[];
  angle?: number;
  style?: ViewStyle;
  children?: ReactNode;
  borderRadius?: number;
}

// Convert CSS-style angle (0 = up, 90 = right, 180 = down, 270 = left)
// into expo-linear-gradient's normalized start/end points.
function angleToPoints(angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    start: { x: 0.5 - Math.cos(rad) / 2, y: 0.5 - Math.sin(rad) / 2 },
    end: { x: 0.5 + Math.cos(rad) / 2, y: 0.5 + Math.sin(rad) / 2 },
  };
}

/**
 * Linear gradient backed by expo-linear-gradient (native, GPU-accelerated).
 * Replaces the previous SVG implementation which ran on the JS thread and
 * stuttered during navigation slide transitions.
 */
export function Gradient({
  colors,
  angle = 135,
  style,
  children,
  borderRadius = 0,
}: GradientProps) {
  const { start, end } = angleToPoints(angle);

  return (
    <View style={[{ overflow: "hidden", borderRadius }, style]}>
      <LinearGradient
        colors={colors as [string, string, ...string[]]}
        start={start}
        end={end}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      {children}
    </View>
  );
}
