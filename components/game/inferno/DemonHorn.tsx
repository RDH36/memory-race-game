import Svg, { Path } from "react-native-svg";
import { INFERNO_THEME } from "../../../lib/skins";

interface Props {
  size?: number;
  color?: string;
  dark?: string;
}

/** Simple demonic horn — curved shape pointing up. */
export function DemonHorn({
  size = 24,
  color = INFERNO_THEME.ember,
  dark = INFERNO_THEME.ink,
}: Props) {
  return (
    <Svg width={size * 0.55} height={size} viewBox="0 0 12 22">
      <Path
        d="M2 22 Q0 16 2 10 Q3 4 6 0 Q9 4 10 10 Q12 16 10 22 Z"
        fill={color}
        stroke={dark}
        strokeWidth={0.6}
        strokeLinejoin="round"
      />
      {/* Subtle inner shading */}
      <Path
        d="M5 18 Q4 12 5 6"
        stroke={dark}
        strokeWidth={0.5}
        fill="none"
        opacity={0.5}
      />
    </Svg>
  );
}
