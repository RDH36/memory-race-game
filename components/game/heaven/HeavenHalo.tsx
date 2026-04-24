import Svg, { Circle } from "react-native-svg";
import { HEAVEN_THEME } from "../../../lib/skins";

interface Props {
  size?: number;
  color?: string;
  accent?: string;
}

/** Concentric gold halo — corner ornament for the Heaven board. */
export function HeavenHalo({
  size = 24,
  color = HEAVEN_THEME.halo,
  accent = HEAVEN_THEME.haloBright,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} fill="none" stroke={color} strokeWidth={1.2} />
      <Circle cx={12} cy={12} r={6} fill={accent} opacity={0.55} />
      <Circle cx={12} cy={12} r={3} fill={color} />
    </Svg>
  );
}
