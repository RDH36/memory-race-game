import Svg, { Circle, Path, Rect } from "react-native-svg";
import { HEAVEN_THEME } from "../../../lib/skins";

interface Props {
  size: number;
  color?: string;
  accent?: string;
}

/** Celtic cross — vertical + horizontal cross with halo circle. */
export function CelticCross({
  size,
  color = HEAVEN_THEME.halo,
  accent = HEAVEN_THEME.gold,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Circle cx={20} cy={17} r={8} fill="none" stroke={accent} strokeWidth={1.2} />
      <Rect x={18.5} y={5} width={3} height={30} fill={color} rx={0.5} />
      <Rect x={10} y={15} width={20} height={3} fill={color} rx={0.5} />
      <Circle cx={20} cy={17} r={1.6} fill={accent} />
      <Path d="M20 5 L21 7 L20 9 L19 7 Z" fill={accent} />
    </Svg>
  );
}
