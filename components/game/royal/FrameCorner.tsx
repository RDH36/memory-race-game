import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { ROYAL_THEME } from "../../../lib/skins";

interface Props {
  size?: number;
  color?: string;
  rotate?: number;
}

/** Decorative corner flourish for the royal frame. */
export function FrameCorner({ size = 22, color = ROYAL_THEME.gold, rotate = 0 }: Props) {
  return (
    <View style={{ width: size, height: size, transform: [{ rotate: `${rotate}deg` }] }}>
      <Svg width={size} height={size} viewBox="0 0 28 28">
        <Path
          d="M2 2 L14 2 M2 2 L2 14 M2 2 C10 2 14 6 14 14 M2 2 C2 10 6 14 14 14"
          stroke={color}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        <Circle cx="14" cy="14" r="1.5" fill={color} />
        <Circle cx="6" cy="6" r="1" fill={color} />
      </Svg>
    </View>
  );
}
