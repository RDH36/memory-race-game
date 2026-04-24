import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";

interface Props {
  hue: number;
  neutral?: boolean;
  size?: number;
}

/**
 * Soft radial halo behind the focus avatar — derived from avatar hue.
 * Uses react-native-svg RadialGradient (RN doesn't support CSS radial gradients).
 */
export function AvatarHalo({ hue, neutral, size = 220 }: Props) {
  const color = neutral ? "#D9D2CD" : `hsl(${hue}, 65%, 70%)`;
  const id = `halo-${hue}-${neutral ? "n" : "h"}`;

  return (
    <Svg
      width={size}
      height={size}
      style={{ position: "absolute", opacity: 0.5 }}
      pointerEvents="none"
    >
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="65%" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width={size} height={size} fill={`url(#${id})`} />
    </Svg>
  );
}
