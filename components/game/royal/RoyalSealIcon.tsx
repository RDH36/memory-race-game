import Svg, { Circle, Path, Rect } from "react-native-svg";
import { ROYAL_THEME } from "../../../lib/skins";

interface Props {
  size: number;
  color?: string;
  accent?: string;
}

export function RoyalSealIcon({
  size,
  color = ROYAL_THEME.gold,
  accent = ROYAL_THEME.goldBright,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Circle cx={25} cy={25} r={23} fill="transparent" stroke={color} strokeWidth={1.5} />
      <Circle cx={25} cy={25} r={19} fill="none" stroke={color} strokeWidth={0.6} strokeDasharray="1 1.5" />
      <Path d="M16 26 L16 20 L20 23 L22 16 L25 21 L28 16 L30 23 L34 20 L34 26 Z" fill={color} />
      <Rect x={16} y={26} width={18} height={2} fill={color} />
      <Circle cx={25} cy={21} r={1.2} fill={accent} />
    </Svg>
  );
}
