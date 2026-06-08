import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/lib/ThemeContext";
import { Btn3D, Bubble, Drop, Mascot } from "@/components/ui/arcade";

// Each avatar is paired with its greeting (same index in home.heroBubbles).
const HERO_AVATARS = ["🦊", "🐼", "🐯", "🦁", "🐸", "🐙", "🦉", "🐨", "🐵", "🦄", "🐺", "🐻"];

export function ArcadeHero() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [violet, violetD] = colors.hues.violet;

  // Avatar + matching greeting cycle together every 5s.
  const [index, setIndex] = useState(() => Math.floor(Math.random() * HERO_AVATARS.length));

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => {
        let next = prev;
        while (next === prev) {
          next = Math.floor(Math.random() * HERO_AVATARS.length);
        }
        return next;
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Smooth infinite up/down bob (Reanimated — no jitter).
  const bob = useSharedValue(0);
  useEffect(() => {
    bob.value = withRepeat(
      withTiming(-8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [bob]);
  const bobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));

  const avatar = HERO_AVATARS[index];
  const bubbles = t("home.heroBubbles", { returnObjects: true });
  const bubbleList = Array.isArray(bubbles) ? (bubbles as string[]) : [];
  const bubble = bubbleList[index] ?? t("home.heroBubble");

  return (
    <Drop style={{ marginBottom: 16 }}>
      <View
        style={{
          overflow: "hidden",
          borderRadius: 28,
          padding: 20,
          paddingBottom: 22,
          backgroundColor: violet,
          boxShadow: `0 5px 0 ${violetD}, 0 20px 34px -12px ${violet}A6`,
        }}
      >
        {/* decorative cards */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: -8,
            bottom: -14,
            width: 60,
            height: 80,
            borderRadius: 12,
            backgroundColor: "rgba(255,255,255,0.10)",
            transform: [{ rotate: "18deg" }],
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: 30,
            bottom: -22,
            width: 54,
            height: 72,
            borderRadius: 12,
            backgroundColor: "rgba(255,255,255,0.14)",
            transform: [{ rotate: "-8deg" }],
          }}
        />

        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
          <Animated.View style={bobStyle}>
            <Mascot emoji={avatar} size={78} />
          </Animated.View>
          <View style={{ flex: 1, paddingTop: 6 }}>
            <Bubble>{bubble}</Bubble>
          </View>
        </View>

        <Text
          style={{
            fontFamily: "Fredoka_700Bold",
            fontSize: 13,
            color: "rgba(255,255,255,0.8)",
            letterSpacing: 1,
            marginBottom: 10,
          }}
        >
          {t("home.heroTagline")}
        </Text>
        <Btn3D
          color="gold"
          size="lg"
          full
          haptic="press"
          onPress={() => router.push("/mode/casual")}
          label={t("home.playCta")}
          textStyle={{ fontSize: 22 }}
        >
          <Text style={{ fontSize: 18 }}>▶</Text>
        </Btn3D>
      </View>
    </Drop>
  );
}
