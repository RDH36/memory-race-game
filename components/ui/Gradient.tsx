import { ReactNode } from "react";
import { View, ViewStyle, StyleSheet } from "react-native";
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from "react-native-svg";

interface GradientProps {
  colors: string[];
  angle?: number;
  style?: ViewStyle;
  children?: ReactNode;
  borderRadius?: number;
}

function angleToCoords(angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x1: 0.5 - Math.cos(rad) / 2,
    y1: 0.5 - Math.sin(rad) / 2,
    x2: 0.5 + Math.cos(rad) / 2,
    y2: 0.5 + Math.sin(rad) / 2,
  };
}

/** SVG-backed linear gradient — no native module required. */
export function Gradient({ colors, angle = 135, style, children, borderRadius = 0 }: GradientProps) {
  const { x1, y1, x2, y2 } = angleToCoords(angle);
  const id = `grad-${colors.join("-")}-${angle}`;

  return (
    <View style={[{ overflow: "hidden", borderRadius }, style]}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgLinearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
            {colors.map((c, i) => (
              <Stop key={i} offset={`${(i / Math.max(1, colors.length - 1)) * 100}%`} stopColor={c} />
            ))}
          </SvgLinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
      {children}
    </View>
  );
}
