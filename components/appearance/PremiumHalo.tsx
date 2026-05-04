import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import type { EntitlementKey } from "../../lib/skins";
import { getPremiumTheme } from "../../lib/premiumTheme";
import { useDeferredAnimation } from "../../lib/perf";

interface Props {
  entitlement: EntitlementKey;
  size?: number;
  /** When true, halo pulses subtly. Default false (static glow). */
  animate?: boolean;
}

export function PremiumHalo({ entitlement, size = 220, animate = false }: Props) {
  const theme = getPremiumTheme(entitlement);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);
  const deferred = useDeferredAnimation();

  useEffect(() => {
    if (!animate || !deferred) return;
    scale.value = withRepeat(
      withTiming(1.08, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withTiming(0.95, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, [animate, deferred]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!theme) return null;

  const gradId = `premium-halo-${entitlement}`;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        },
        animatedStyle,
      ]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={gradId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor={theme.haloColor} stopOpacity="1" />
            <Stop offset="35%" stopColor={theme.haloColor} stopOpacity="0.7" />
            <Stop offset="60%" stopColor={theme.haloAccent} stopOpacity="0.4" />
            <Stop offset="85%" stopColor={theme.haloAccent} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={size} height={size} fill={`url(#${gradId})`} />
      </Svg>
    </Animated.View>
  );
}
