import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { ConfettiParticles } from "../../components/result/ConfettiParticles";

function BounceEmoji({ emoji, result }: { emoji: string; result: string }) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      200,
      withSpring(1, { damping: 6, stiffness: 180 }),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{ alignItems: "center" }}>
      {result === "won" && <ConfettiParticles />}
      <Animated.Text style={[style, { fontSize: 72 }]}>{emoji}</Animated.Text>
    </View>
  );
}

function PulsingCta({
  label,
  onPress,
  bgColor,
}: {
  label: string;
  onPress: () => void;
  bgColor: string;
}) {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withDelay(
      1200,
      withRepeat(
        withSequence(
          withTiming(1.04, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(1200).duration(500)}
      style={{ paddingBottom: 24 }}
    >
      <Pressable onPress={onPress}>
        <Animated.View
          style={[
            style,
            {
              backgroundColor: bgColor,
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: "center",
            },
          ]}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Fredoka_700Bold",
              color: "#FFFFFF",
            }}
          >
            {label} →
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function ResultScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { avatar } = usePlayerStats();
  const params = useLocalSearchParams<{ p1?: string; p2?: string }>();

  const p1 = Number(params.p1 ?? 0);
  const p2 = Number(params.p2 ?? 0);
  const result = p1 > p2 ? "won" : p1 < p2 ? "lost" : "draw";

  const titleColor =
    result === "won"
      ? colors.success
      : result === "lost"
        ? colors.error
        : colors.primaryContainer;

  const ctaKey = `onboarding.result.cta${result.charAt(0).toUpperCase() + result.slice(1)}`;
  const emoji = result === "won" ? "🏆" : result === "lost" ? "😤" : "🤝";

  const handleCta = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await AsyncStorage.setItem("onboarding_complete", "true");
    router.replace("/auth");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {/* Result */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          {/* Motivational hook */}
          <Animated.View
            entering={FadeIn.delay(200).duration(600)}
            style={{
              marginBottom: 20,
              backgroundColor: result === "won" ? colors.successBg : result === "lost" ? colors.errorBg : colors.primaryContainerBg,
              borderRadius: 12,
              paddingHorizontal: 20,
              paddingVertical: 14,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Nunito_600SemiBold",
                color: result === "won" ? colors.success : result === "lost" ? colors.error : colors.primaryContainer,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              {t(`onboarding.result.${result}Hook`)}
            </Text>
          </Animated.View>

          {/* Emoji with bounce + confetti */}
          <BounceEmoji emoji={emoji} result={result} />

          {/* Title */}
          <Animated.Text
            entering={FadeInDown.delay(400).duration(500)}
            style={{
              fontSize: 36,
              fontFamily: "Fredoka_700Bold",
              color: titleColor,
              textAlign: "center",
              marginTop: 12,
            }}
          >
            {t(`onboarding.result.${result}`)}
          </Animated.Text>

          {/* Score card */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(500)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 20,
              marginTop: 24,
              backgroundColor: colors.surfaceContainer,
              borderRadius: 16,
              paddingHorizontal: 28,
              paddingVertical: 16,
            }}
          >
            {/* Player */}
            <View style={{ alignItems: "center", flex: 1 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: colors.p1Bg,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Text style={{ fontSize: 20 }}>{avatar}</Text>
              </View>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Nunito_600SemiBold",
                  color: colors.p1,
                }}
              >
                {t("onboarding.result.you")}
              </Text>
              <Text
                style={{
                  fontSize: 32,
                  fontFamily: "Fredoka_700Bold",
                  color: colors.p1,
                }}
              >
                {p1}
              </Text>
            </View>

            {/* Separator */}
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Fredoka_600SemiBold",
                color: colors.onSurfaceVariant,
              }}
            >
              —
            </Text>

            {/* BabyBot */}
            <View style={{ alignItems: "center", flex: 1 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: colors.p2Bg,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Text style={{ fontSize: 20 }}>🐣</Text>
              </View>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Nunito_600SemiBold",
                  color: colors.p2,
                }}
              >
                BabyBot
              </Text>
              <Text
                style={{
                  fontSize: 32,
                  fontFamily: "Fredoka_700Bold",
                  color: colors.p2,
                }}
              >
                {p2}
              </Text>
            </View>
          </Animated.View>

          {/* Subtitle */}
          <Animated.Text
            entering={FadeInDown.delay(800).duration(500)}
            style={{
              fontSize: 15,
              fontFamily: "Nunito_600SemiBold",
              color: colors.onSurfaceVariant,
              textAlign: "center",
              marginTop: 12,
            }}
          >
            {t(`onboarding.result.${result}Sub`)}
          </Animated.Text>

        </View>

        {/* CTA with pulse */}
        <PulsingCta
          label={t(ctaKey)}
          onPress={handleCta}
          bgColor={colors.primaryContainer}
        />
      </View>
    </SafeAreaView>
  );
}
