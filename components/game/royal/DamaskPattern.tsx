import Svg, { Circle, Defs, G, Path, Pattern, Rect } from "react-native-svg";
import { ROYAL_THEME } from "../../../lib/skins";

interface Props {
  width: number;
  height: number;
  bg?: string;
  motif?: string;
  motifOpacity?: number;
}

/**
 * Repeating damask pattern (80×80 tile) using SVG <Pattern>.
 * Renders as an absolute-positioned overlay covering width × height.
 */
export function DamaskPattern({
  width,
  height,
  bg = ROYAL_THEME.frame,
  motif = ROYAL_THEME.gold,
  motifOpacity = 0.55,
}: Props) {
  return (
    <Svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
      <Defs>
        <Pattern id="damask" width="80" height="80" patternUnits="userSpaceOnUse">
          <Rect width="80" height="80" fill={bg} />
          <G fill={motif} opacity={motifOpacity}>
            <Path d="M40 8 C44 14 50 16 56 16 C50 20 46 26 46 32 C46 26 42 20 36 18 C42 16 44 14 40 8 Z" />
            <Path d="M40 48 C44 54 50 56 56 56 C50 60 46 66 46 72 C46 66 42 60 36 58 C42 56 44 54 40 48 Z" />
            <Path d="M0 28 C4 34 10 36 16 36 C10 40 6 46 6 52 C6 46 2 40 -4 38 Z" />
            <Path d="M80 28 C76 34 70 36 64 36 C70 40 74 46 74 52 C74 46 78 40 84 38 Z" />
            <Circle cx="40" cy="28" r="2.2" />
            <Circle cx="40" cy="68" r="2.2" />
            <Circle cx="0" cy="48" r="2" />
            <Circle cx="80" cy="48" r="2" />
          </G>
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#damask)" />
    </Svg>
  );
}
