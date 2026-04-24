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
import { HEAVEN_THEME } from "../../../lib/skins";

interface Props {
  density?: "low" | "medium" | "high";
}

interface ParticleSpec {
  id: number;
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
}

const COUNTS = { low: 6, medium: 10, high: 14 };

/**
 * Heaven particles — slow gold motes drifting upward.
 * Slower than Inferno sparks (4-7s vs 2.2-4s) for a contemplative feel.
 */
export function HeavenParticles({ density = "low" }: Props) {
  const n = COUNTS[density];
  const particles = useMemo<ParticleSpec[]>(
    () =>
      Array.from({ length: n }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 2 + Math.random() * 3,
        delay: Math.random() * 5000,
        duration: 4000 + Math.random() * 3000,
      })),
    [n],
  );

  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
      {particles.map((p) => (
        <Particle key={p.id} spec={p} />
      ))}
    </View>
  );
}

function Particle({ spec }: { spec: ParticleSpec }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    const half = spec.duration / 2;
    opacity.value = withDelay(
      spec.delay,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: half, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: half, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      ),
    );
    translateY.value = withDelay(
      spec.delay,
      withRepeat(
        withTiming(-30, { duration: spec.duration, easing: Easing.out(Easing.cubic) }),
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
          backgroundColor: HEAVEN_THEME.haloBright,
          shadowColor: HEAVEN_THEME.gold,
          shadowOpacity: 0.9,
          shadowRadius: 5,
        },
        style,
      ]}
    />
  );
}
