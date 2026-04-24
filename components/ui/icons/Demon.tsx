import Svg, { Circle, Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
}

export function Demon({ size = 48, color = "#FFFFFF" }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path d="M18 12 L 16 4 L 21 10 Z" fill={color} />
      <Path d="M30 12 L 32 4 L 27 10 Z" fill={color} />
      <Circle cx="24" cy="18" r="6" fill={color} />
      <Path d="M18 22 L 6 24 L 10 28 L 6 32 L 14 32 L 17 28 Z" fill={color} opacity={0.9} />
      <Path d="M30 22 L 42 24 L 38 28 L 42 32 L 34 32 L 31 28 Z" fill={color} opacity={0.9} />
      <Path d="M18 24 L 20 40 L 28 40 L 30 24 Z" fill={color} opacity={0.85} />
      <Path d="M28 38 L 34 44 L 32 40 L 36 42 Z" fill={color} opacity={0.8} />
    </Svg>
  );
}
