import { useEffect } from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

/**
 * Animated "tap here" finger — the staple guidance cue of mobile-game
 * tutorials (Royal Match, Candy Crush). It bobs + taps in place to draw the
 * eye to the one action the player should take. Position it with `style`
 * (absolute) over the target.
 */
export function HandPointer({
  style,
  delay = 0,
  size = 44,
  pointing = "up",
}: {
  style?: StyleProp<ViewStyle>;
  delay?: number;
  size?: number;
  pointing?: "up" | "down";
}) {
  const t = useSharedValue(0);
  const dir = pointing === "up" ? 1 : -1;

  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 420, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 520, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 260 }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, t]);

  const anim = useAnimatedStyle(() => ({
    transform: [
      { translateY: dir * (10 - t.value * 14) },
      { scale: 1 - t.value * 0.12 },
    ],
  }));

  return (
    <Animated.View pointerEvents="none" style={[{ position: "absolute" }, style]}>
      <Animated.View style={anim}>
        <Text style={{ fontSize: size }}>{pointing === "up" ? "👆" : "👇"}</Text>
      </Animated.View>
    </Animated.View>
  );
}
