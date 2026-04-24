import Svg, { Circle, Path } from "react-native-svg";
import { INFERNO_THEME } from "../../../lib/skins";

interface Props {
  size: number;
  color?: string;
  accent?: string;
}

/**
 * Goetic sigil — inverted pentagram inside a circle.
 * Trimmed for perf: removed side dashes + top drips (visible noise on small sizes).
 */
export function GoeticSigil({
  size,
  color = INFERNO_THEME.ember,
  accent = INFERNO_THEME.emberBright,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Circle cx={20} cy={20} r={17} fill="none" stroke={color} strokeWidth={1} />
      <Path
        d="M20 32 L10.5 13 L27.5 25 L12.5 25 L29.5 13 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.3}
        strokeLinejoin="round"
      />
      <Circle cx={20} cy={24} r={1.3} fill={accent} />
    </Svg>
  );
}
