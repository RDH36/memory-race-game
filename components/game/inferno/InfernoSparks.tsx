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
import { INFERNO_THEME } from "../../../lib/skins";

interface Props {
  density?: "low" | "medium" | "high";
}

interface SparkSpec {
  id: number;
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
}

const COUNTS = { low: 6, medium: 10, high: 14 };

/**
 * Ascending sparks — emerge from bottom and rise with fade.
 * Lean implementation: opacity + translateY only (UI-thread Reanimated).
 */
export function InfernoSparks({ density = "medium" }: Props) {
  const n = COUNTS[density];
  const sparks = useMemo<SparkSpec[]>(
    () =>
      Array.from({ length: n }, (_, i) => ({
        id: i,
        top: 50 + Math.random() * 50,
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 4000,
        duration: 2200 + Math.random() * 2000,
      })),
    [n],
  );

  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
      {sparks.map((s) => (
        <Spark key={s.id} spec={s} />
      ))}
    </View>
  );
}

function Spark({ spec }: { spec: SparkSpec }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    const half = spec.duration / 2;
    opacity.value = withDelay(
      spec.delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: half, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: half, easing: Easing.in(Easing.quad) }),
        ),
        -1,
      ),
    );
    translateY.value = withDelay(
      spec.delay,
      withRepeat(
        withTiming(-50, { duration: spec.duration, easing: Easing.out(Easing.cubic) }),
        -1,
        false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

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
          backgroundColor: INFERNO_THEME.hotCore,
          shadowColor: INFERNO_THEME.ember,
          shadowOpacity: 0.9,
          shadowRadius: 5,
        },
        style,
      ]}
    />
  );
}
