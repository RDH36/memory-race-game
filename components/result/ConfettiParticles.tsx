import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
} from "react-native-reanimated";

const CONFETTI_EMOJIS = ["🎊", "⭐", "✨", "🎉", "💫", "🌟"];
const CONFETTI_COUNT = 8;

function ConfettiParticle({ index }: { index: number }) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    const delay = 200 + index * 80;
    const xOffset = (index % 2 === 0 ? -1 : 1) * (30 + Math.random() * 60);

    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
    translateY.value = withDelay(
      delay,
      withTiming(-120 - Math.random() * 80, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      }),
    );
    translateX.value = withDelay(
      delay,
      withTiming(xOffset, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      }),
    );
    rotation.value = withDelay(
      delay,
      withRepeat(withTiming(360, { duration: 800 }), 2, false),
    );

    opacity.value = withDelay(delay + 800, withTiming(0, { duration: 400 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    position: "absolute" as const,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[style, { fontSize: 20 }]}>
      {CONFETTI_EMOJIS[index % CONFETTI_EMOJIS.length]}
    </Animated.Text>
  );
}

export function ConfettiParticles() {
  return (
    <View style={{ position: "absolute", alignItems: "center" }}>
      {Array.from({ length: CONFETTI_COUNT }, (_, i) => (
        <ConfettiParticle key={i} index={i} />
      ))}
    </View>
  );
}
