import Svg, { Circle, Ellipse, Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
}

export function Angel({ size = 48, color = "#FFFFFF" }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Ellipse cx="24" cy="10" rx="7" ry="2" stroke={color} strokeWidth="2" />
      <Circle cx="24" cy="18" r="5" fill={color} />
      <Path d="M19 22 C 10 22, 6 28, 8 36 C 14 34, 18 30, 19 26 Z" fill={color} opacity={0.95} />
      <Path d="M29 22 C 38 22, 42 28, 40 36 C 34 34, 30 30, 29 26 Z" fill={color} opacity={0.95} />
      <Path d="M18 26 L 20 40 L 28 40 L 30 26 Z" fill={color} opacity={0.85} />
    </Svg>
  );
}
