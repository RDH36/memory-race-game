import Svg, { Circle, Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
}

export function Crown({ size = 20, color = "#FFD366" }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M3 8 L 7 12 L 12 5 L 17 12 L 21 8 L 19 18 L 5 18 Z" />
      <Circle cx="3" cy="8" r="1.5" />
      <Circle cx="21" cy="8" r="1.5" />
      <Circle cx="12" cy="4" r="1.5" />
    </Svg>
  );
}
