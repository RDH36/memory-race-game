import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import type { PanelActor } from "../../lib/story";

const EASE = Easing.inOut(Easing.ease);
const ANIM_DURATION: Record<PanelActor["anim"], number> = {
  bob: 1600,
  shake: 90,
  pulse: 1400,
  fade: 1100,
  spin: 7000,
};

export function ActorEmoji({ actor, active = true }: { actor: PanelActor; active?: boolean }) {
  const v = useSharedValue(0);

  // Loops only run while the panel is near the viewport — dozens of
  // concurrent off-screen animations otherwise tank the UI thread.
  useEffect(() => {
    if (!active) {
      cancelAnimation(v);
      v.value = 0;
      return;
    }
    v.value = withDelay(
      actor.delay ?? 0,
      withRepeat(
        withTiming(1, {
          duration: ANIM_DURATION[actor.anim],
          easing: actor.anim === "spin" ? Easing.linear : EASE,
        }),
        -1,
        actor.anim !== "spin",
      ),
    );
    return () => cancelAnimation(v);
  }, [active]);

  const style = useAnimatedStyle(() => {
    switch (actor.anim) {
      case "bob":
        return { transform: [{ translateY: interpolate(v.value, [0, 1], [-7, 7]) }] };
      case "shake":
        return { transform: [{ translateX: interpolate(v.value, [0, 1], [-3, 3]) }] };
      case "pulse":
        return { transform: [{ scale: interpolate(v.value, [0, 1], [1, 1.14]) }] };
      case "fade":
        return { opacity: interpolate(v.value, [0, 1], [1, 0.15]) };
      case "spin":
        return { transform: [{ rotate: `${v.value * 360}deg` }] };
    }
  });

  const box = Math.ceil(actor.size * 1.4);
  return (
    <View
      style={{
        position: "absolute",
        left: -box / 2,
        top: -box / 2,
        width: box,
        height: box,
        alignItems: "center",
        justifyContent: "center",
        transform: [{ translateX: actor.x }, { translateY: actor.y }],
      }}
    >
      <Animated.View style={style}>
        <Text style={{ fontSize: actor.size }}>{actor.emoji}</Text>
      </Animated.View>
    </View>
  );
}

export function SpeechBubble({ text, x, y }: { text: string; x: number; y: number }) {
  return (
    <Animated.View
      entering={FadeIn.delay(450).duration(400)}
      style={{
        position: "absolute",
        left: x - 110,
        top: y - 26,
        width: 220,
        alignItems: "center",
      }}
    >
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: 9,
          boxShadow: "0 3px 0 #00000055",
        }}
      >
        <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 14, color: "#1A1330", textAlign: "center" }}>
          {text}
        </Text>
      </View>
      {/* Bubble tail */}
      <View
        style={{
          width: 12,
          height: 12,
          marginTop: -7,
          backgroundColor: "#FFFFFF",
          transform: [{ rotate: "45deg" }],
        }}
      />
    </Animated.View>
  );
}

export function Particle({ color, left, delay, size }: { color: string; left: number; delay: number; size: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 4200, easing: Easing.linear }), -1),
    );
    return () => cancelAnimation(progress);
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.15, 0.75, 1], [0, 0.8, 0.35, 0]),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [0, -300]) }],
  }));

  return (
    <Animated.View
      style={[
        { position: "absolute", bottom: 24, left: `${left}%`, width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style,
      ]}
    />
  );
}
