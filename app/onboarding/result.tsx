import { useEffect } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { ConfettiParticles } from "../../components/result/ConfettiParticles";
import { Btn3D, Mascot } from "@/components/ui/arcade";

function BounceMascot({ emoji, result }: { emoji: string; result: string }) {
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
      <Animated.View style={style}>
        <Mascot emoji={emoji} size={84} />
      </Animated.View>
    </View>
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
              borderRadius: 14,
              paddingHorizontal: 20,
              paddingVertical: 14,
              boxShadow: `0 3px 0 ${colors.panelLip}, 0 8px 18px -8px ${colors.panelShadow}`,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Fredoka_600SemiBold",
                color: result === "won" ? colors.success : result === "lost" ? colors.error : colors.primaryContainer,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              {t(`onboarding.result.${result}Hook`)}
            </Text>
          </Animated.View>

          {/* Mascot with bounce + confetti */}
          <BounceMascot emoji={emoji} result={result} />

          {/* Title */}
          <Animated.Text
            entering={FadeInDown.delay(400).duration(500)}
            style={{
              fontSize: 38,
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
              gap: 24,
              marginTop: 24,
              backgroundColor: colors.surfaceContainer,
              borderRadius: 20,
              paddingHorizontal: 28,
              paddingVertical: 20,
              boxShadow: `0 4px 0 ${colors.panelLip}, 0 12px 22px -12px ${colors.panelShadow}`,
            }}
          >
            {/* Player */}
            <View style={{ alignItems: "center", flex: 1 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  backgroundColor: colors.hues.blue[0],
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 8,
                  boxShadow: `0 4px 0 ${colors.hues.blue[1]}`,
                }}
              >
                <Text style={{ fontSize: 28 }}>{avatar}</Text>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Fredoka_700Bold",
                  color: colors.p1,
                }}
              >
                {t("onboarding.result.you")}
              </Text>
              <Text
                style={{
                  fontSize: 36,
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
                fontSize: 15,
                fontFamily: "Fredoka_700Bold",
                color: colors.onSurfaceMuted,
              }}
            >
              VS
            </Text>

            {/* BabyBot */}
            <View style={{ alignItems: "center", flex: 1 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  backgroundColor: colors.hues.coral[0],
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 8,
                  boxShadow: `0 4px 0 ${colors.hues.coral[1]}`,
                }}
              >
                <Text style={{ fontSize: 28 }}>🐣</Text>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Fredoka_700Bold",
                  color: colors.p2,
                }}
              >
                BabyBot
              </Text>
              <Text
                style={{
                  fontSize: 36,
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
              fontFamily: "Fredoka_600SemiBold",
              color: colors.onSurfaceVariant,
              textAlign: "center",
              marginTop: 16,
            }}
          >
            {t(`onboarding.result.${result}Sub`)}
          </Animated.Text>

        </View>

        {/* CTA */}
        <Animated.View
          entering={FadeInDown.delay(1200).duration(500)}
          style={{ paddingBottom: 24 }}
        >
          <Btn3D
            color="gold"
            size="lg"
            full
            haptic="press"
            label={t(ctaKey)}
            onPress={handleCta}
          >
            <Text style={{ fontSize: 18 }}>→</Text>
          </Btn3D>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
