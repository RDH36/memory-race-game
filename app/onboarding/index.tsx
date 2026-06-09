import { useEffect } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

const TEASER_EMOJIS = ["🐶", "?", "🦊"];

function FloatingCard({ emoji, delay, x }: { emoji: string; delay: number; x: number }) {
  const { colors } = useTheme();
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const isQuestionCard = emoji === "?";

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
          borderRadius: 16,
          backgroundColor: isQuestionCard ? colors.hues.violet[0] : colors.surfaceContainer,
          justifyContent: "center",
          alignItems: "center",
          marginHorizontal: x,
          boxShadow: isQuestionCard
            ? `0 4px 0 ${colors.hues.violet[1]}, 0 12px 22px -12px ${colors.panelShadow}`
            : `0 4px 0 ${colors.panelLip}, 0 12px 22px -12px ${colors.panelShadow}`,
        },
      ]}
    >
      {isQuestionCard ? (
        <Text style={{ fontSize: 28, fontFamily: "Fredoka_700Bold", color: "#fff" }}>?</Text>
      ) : (
        <Text style={{ fontSize: 32 }}>{emoji}</Text>
      )}
    </Animated.View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const handleStart = () => {
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
            <Text style={{ fontSize: 18, color: "#fff" }}>▶</Text>
          </Btn3D>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
