import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useTheme } from "@/lib/ThemeContext";
import type { HueName } from "@/components/ui/theme";

/**
 * Transient "power cast!" banner shown over the board when P1 activates an
 * ability — pops in, holds, fades out, then calls onDone so the parent can
 * clear it. Mounted with a unique key per cast to replay the animation.
 */
export function PowerCastBanner({
  emoji,
  label,
  color,
  onDone,
}: {
  emoji: string;
  label: string;
  color: HueName;
  onDone: () => void;
}) {
  const { colors } = useTheme();
  const [base, lip] = colors.hues[color];

  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 160 }),
      withDelay(900, withTiming(0, { duration: 260 }, (done) => {
        if (done) runOnJS(onDone)();
      })),
    );
    scale.value = withSequence(
      withSpring(1, { damping: 11, stiffness: 190 }),
      withDelay(900, withTiming(0.92, { duration: 260 })),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { rotateZ: "-8deg" }],
  }));

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}
    >
      <Animated.View
        style={[
          style,
          {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            backgroundColor: base,
            borderRadius: 22,
            paddingVertical: 16,
            paddingHorizontal: 28,
            boxShadow: `0 7px 0 ${lip}, 0 20px 36px -10px ${base}99`,
          },
        ]}
      >
        {/* gloss */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: "8%",
            right: "8%",
            top: 7,
            height: "34%",
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.28)",
          }}
        />
        <Text style={{ fontSize: 44 }}>{emoji}</Text>
        <Text
          style={{
            fontFamily: "Fredoka_700Bold",
            fontSize: 30,
            color: "#fff",
            textShadowColor: lip,
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 0,
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </View>
  );
}
