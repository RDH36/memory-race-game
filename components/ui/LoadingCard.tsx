import { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";

const EMOJIS = ["🐶", "🦊", "🐸", "🐱", "🌸", "⚡", "🚀", "🎲"];

function randomEmoji() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

export function LoadingCard() {
  const { colors } = useTheme();
  const rotateY = useSharedValue(0);
  const [emoji, setEmoji] = useState(randomEmoji);
  const faceUp = useRef(false);

  useEffect(() => {
    const flip = () => {
      faceUp.current = !faceUp.current;
      rotateY.value = withTiming(faceUp.current ? 180 : 0, { duration: 400 });
      if (!faceUp.current) setEmoji(randomEmoji());
    };

    // First flip immediately
    const firstFlip = setTimeout(flip, 300);
    const interval = setInterval(flip, 900);

    return () => {
      clearTimeout(firstFlip);
      clearInterval(interval);
    };
  }, []);

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateY: `${interpolate(rotateY.value, [0, 180], [0, 180])}deg` },
    ],
  }));

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateY: `${interpolate(rotateY.value, [0, 180], [180, 360])}deg` },
    ],
  }));

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: 80, height: 100 }}>
        {/* Back — "?" */}
        <Animated.View
          style={[
            backStyle,
            {
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.p1Bg,
            },
          ]}
        >
          <Text style={{ fontSize: 32, fontFamily: "Fredoka_700Bold", color: colors.p1 }}>
            ?
          </Text>
        </Animated.View>
        {/* Front — emoji */}
        <Animated.View
          style={[
            frontStyle,
            {
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.surfaceContainer,
            },
          ]}
        >
          <Text style={{ fontSize: 36 }}>{emoji}</Text>
        </Animated.View>
      </View>
    </View>
  );
}
