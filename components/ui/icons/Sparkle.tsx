import Svg, { Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
}

export function Sparkle({ size = 16, color = "#FFD366" }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2 L 13.5 10.5 L 22 12 L 13.5 13.5 L 12 22 L 10.5 13.5 L 2 12 L 10.5 10.5 Z" />
    </Svg>
  );
}
