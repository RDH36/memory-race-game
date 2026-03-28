import { useEffect } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
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

const TEASER_EMOJIS = ["🐶", "🐱", "🦊"];

function FloatingCard({ emoji, delay, x }: { emoji: string; delay: number; x: number }) {
  const { colors } = useTheme();
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

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      entering={FadeIn.delay(300 + delay).duration(600)}
      style={[
        style,
        {
          width: 72,
          height: 90,
          borderRadius: 12,
          backgroundColor: colors.surfaceContainer,
          justifyContent: "center",
          alignItems: "center",
          marginHorizontal: x,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 3,
        },
      ]}
    >
      <Text style={{ fontSize: 32 }}>{emoji}</Text>
    </Animated.View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/onboarding/flip");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {/* Progress dots */}
        <Animated.View
          entering={FadeIn.delay(100).duration(400)}
          style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 16 }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
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

        {/* Floating cards */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 48 }}>
            {TEASER_EMOJIS.map((emoji, i) => (
              <FloatingCard key={emoji} emoji={emoji} delay={i * 200} x={i === 1 ? 12 : 0} />
            ))}
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

        {/* CTA — Green zone (bottom) */}
        <Animated.View entering={FadeInDown.delay(1000).duration(500)} style={{ paddingBottom: 24 }}>
          <Animated.View
            style={{
              backgroundColor: colors.primaryContainer,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text
              onPress={handleStart}
              style={{
                fontSize: 16,
                fontFamily: "Fredoka_600SemiBold",
                color: "#FFFFFF",
              }}
            >
              {t("onboarding.welcome.cta")} →
            </Text>
          </Animated.View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
