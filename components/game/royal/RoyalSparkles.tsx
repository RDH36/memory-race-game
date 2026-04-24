import { useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { ROYAL_THEME } from "../../../lib/skins";

interface Props {
  density?: "low" | "medium" | "high";
  color?: string;
}

interface SparkleSpec {
  id: number;
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
}

const COUNTS = { low: 4, medium: 8, high: 12 };

/**
 * Lightweight sparkles overlay. Uses a SINGLE shared value per particle (animated
 * opacity only) to keep cost low — pure JS scale via View transform-free triangle.
 * Default density "medium" (8 particles) for solid 60fps on mid-range Androids.
 */
export function RoyalSparkles({ density = "medium", color = ROYAL_THEME.goldBright }: Props) {
  const n = COUNTS[density];
  const sparkles = useMemo<SparkleSpec[]>(
    () =>
      Array.from({ length: n }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 4 + Math.random() * 4,
        delay: Math.random() * 3000,
        duration: 2200 + Math.random() * 1800,
      })),
    [n],
  );

  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
      {sparkles.map((s) => (
        <Sparkle key={s.id} spec={s} color={color} />
      ))}
    </View>
  );
}

function Sparkle({ spec, color }: { spec: SparkleSpec; color: string }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    const half = spec.duration / 2;
    opacity.value = withDelay(
      spec.delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: half, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: half, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: `${spec.top}%`,
          left: `${spec.left}%`,
          width: spec.size,
          height: spec.size,
          borderRadius: spec.size / 2,
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.8,
          shadowRadius: 4,
        },
        style,
      ]}
    />
  );
}
