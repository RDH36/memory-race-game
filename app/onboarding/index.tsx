import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";
import { Btn3D } from "@/components/ui/arcade";
import { IrisTransition } from "../../components/onboarding/IrisTransition";

function useFloat(delay: number) {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-12, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
          withTiming(12, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
    rotate.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-5, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
          withTiming(5, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  return useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { rotate: `${rotate.value}deg` }],
  }));
}

function StoryCard({ emoji, delay, x }: { emoji: string; delay: number; x: number }) {
  const { colors } = useTheme();
  const float = useFloat(delay);

  return (
    <Animated.View
      entering={FadeIn.delay(300 + delay).duration(600)}
      style={[
        float,
        {
          width: 72,
          height: 90,
          borderRadius: 16,
          backgroundColor: colors.surfaceContainer,
          justifyContent: "center",
          alignItems: "center",
          marginHorizontal: x,
          boxShadow: `0 4px 0 ${colors.panelLip}, 0 12px 22px -12px ${colors.panelShadow}`,
        },
      ]}
    >
      <Text style={{ fontSize: 32 }}>{emoji}</Text>
    </Animated.View>
  );
}

// The center card flips on its own every few seconds, revealing a memory —
// the game pitches itself through its own mechanic.
function MemoryCard({ delay }: { delay: number }) {
  const { colors } = useTheme();
  const float = useFloat(delay);
  const rotateY = useSharedValue(0);

  useEffect(() => {
    rotateY.value = withRepeat(
      withSequence(
        withDelay(2000, withTiming(180, { duration: 650, easing: Easing.inOut(Easing.ease) })),
        withDelay(2000, withTiming(360, { duration: 650, easing: Easing.inOut(Easing.ease) })),
      ),
      -1,
      false,
    );
  }, []);

  const face = {
    position: "absolute" as const,
    width: 80,
    height: 100,
    borderRadius: 16,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backfaceVisibility: "hidden" as const,
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateY: `${rotateY.value}deg` }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateY: `${rotateY.value + 180}deg` }],
  }));

  return (
    <Animated.View
      entering={FadeIn.delay(300 + delay).duration(600)}
      style={[float, { width: 80, height: 100, marginHorizontal: 12 }]}
    >
      <Animated.View
        style={[
          face,
          frontStyle,
          {
            backgroundColor: colors.hues.violet[0],
            boxShadow: `0 4px 0 ${colors.hues.violet[1]}, 0 12px 22px -12px ${colors.panelShadow}`,
          },
        ]}
      >
        <Text style={{ fontSize: 30, fontFamily: "Fredoka_700Bold", color: "#fff" }}>?</Text>
      </Animated.View>
      <Animated.View
        style={[
          face,
          backStyle,
          {
            backgroundColor: colors.surfaceContainer,
            boxShadow: `0 4px 0 ${colors.panelLip}, 0 12px 22px -12px ${colors.panelShadow}`,
          },
        ]}
      >
        <Text style={{ fontSize: 34 }}>🧠</Text>
      </Animated.View>
    </Animated.View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [leaving, setLeaving] = useState(false);

  // If the screen ever regains focus, lift the iris so it isn't stuck black.
  useFocusEffect(useCallback(() => setLeaving(false), []));

  const handleStart = () => {
    if (!leaving) setLeaving(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {/* Progress dots */}
        <Animated.View
          entering={FadeIn.delay(100).duration(400)}
          style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 16 }}
        >
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                width: i === 0 ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === 0 ? colors.primaryContainer : colors.primaryContainerBg,
              }}
            />
          ))}
        </Animated.View>

        {/* Story cast as floating cards: villain · memory · hero */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 48 }}>
            <StoryCard emoji="😈" delay={0} x={0} />
            <MemoryCard delay={200} />
            <StoryCard emoji="🦸" delay={400} x={0} />
          </View>

          {/* Title */}
          <Animated.Text
            entering={FadeInDown.delay(600).duration(500)}
            style={{
              fontSize: 32,
              fontFamily: "Fredoka_700Bold",
              color: colors.onSurface,
              textAlign: "center",
              lineHeight: 40,
            }}
          >
            {t("onboarding.welcome.question")}
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(800).duration(500)}
            style={{
              fontSize: 15,
              fontFamily: "Nunito_400Regular",
              color: colors.onSurfaceVariant,
              textAlign: "center",
              marginTop: 12,
              lineHeight: 22,
            }}
          >
            {t("onboarding.welcome.subtitle")}
          </Animated.Text>
        </View>

        {/* CTA */}
        <Animated.View entering={FadeInDown.delay(1000).duration(500)} style={{ paddingBottom: 24 }}>
          <Btn3D
            color="violet"
            size="lg"
            full
            haptic="press"
            label={t("onboarding.welcome.cta")}
            onPress={handleStart}
          >
            <Text style={{ fontSize: 18, color: "#fff" }}>📖</Text>
          </Btn3D>
        </Animated.View>
      </View>
    </SafeAreaView>

    {/* Iris-out into the story — navigate once the screen is fully dark */}
    {leaving && <IrisTransition onDone={() => router.push("/onboarding/prelude")} />}
    </View>
  );
}
