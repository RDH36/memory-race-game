import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
} from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";

const EMOJI = "🐶";
const AnimatedView = Animated.createAnimatedComponent(View);

function TutorialCard({
  isFaceUp,
  onPress,
  disabled,
}: {
  isFaceUp: boolean;
  onPress: () => void;
  disabled: boolean;
}) {
  const { colors } = useTheme();
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotateY.value = withTiming(isFaceUp ? 180 : 0, { duration: 320 });
  }, [isFaceUp]);

  useEffect(() => {
    if (isFaceUp) {
      scale.value = withSequence(
        withSpring(1.08, { damping: 6, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 200 }),
      );
    }
  }, [isFaceUp]);

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateY: `${interpolate(rotateY.value, [0, 180], [0, 180])}deg` },
    ],
  }));

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateY: `${interpolate(rotateY.value, [0, 180], [180, 360])}deg` },
    ],
  }));

  return (
    <Pressable onPress={onPress} disabled={disabled} style={{ width: 100, height: 120 }}>
      <View style={{ position: "relative", width: "100%", height: "100%" }}>
        <AnimatedView
          style={[
            backStyle,
            {
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              backgroundColor: colors.p1Bg,
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <Text style={{ fontSize: 28, fontFamily: "Fredoka_700Bold", color: colors.p1 }}>?</Text>
        </AnimatedView>
        <AnimatedView
          style={[
            frontStyle,
            {
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              backgroundColor: colors.surfaceContainer,
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 2,
              borderColor: colors.p1 + "33",
            },
          ]}
        >
          <Text style={{ fontSize: 36 }}>{EMOJI}</Text>
        </AnimatedView>
      </View>
    </Pressable>
  );
}

export default function FlipScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [flipped, setFlipped] = useState<boolean[]>([false, false]);
  const [step, setStep] = useState<"tap1" | "tap2" | "matched">("tap1");

  const handleFlip = (index: number) => {
    if (step === "matched") return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = [...flipped];
    next[index] = true;
    setFlipped(next);

    if (step === "tap1") {
      setStep("tap2");
    } else if (step === "tap2") {
      setStep("matched");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        router.push("/onboarding/match");
      }, 1200);
    }
  };

  const getMessage = () => {
    if (step === "tap1") return `${t("onboarding.flip.title")} ${t("onboarding.flip.subtitle")}`;
    if (step === "tap2") return t("onboarding.flip.hint");
    return t("onboarding.flip.match");
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
                width: i === 1 ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i <= 1 ? colors.primaryContainer : colors.primaryContainerBg,
              }}
            />
          ))}
        </Animated.View>

        {/* Cards area */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={{ flexDirection: "row", gap: 20, marginBottom: 40 }}
          >
            <TutorialCard
              isFaceUp={flipped[0]}
              onPress={() => handleFlip(0)}
              disabled={flipped[0]}
            />
            <TutorialCard
              isFaceUp={flipped[1]}
              onPress={() => handleFlip(1)}
              disabled={flipped[1]}
            />
          </Animated.View>

          {/* Instruction text */}
          <Animated.Text
            entering={FadeInDown.delay(400).duration(400)}
            style={{
              fontSize: step === "matched" ? 26 : 18,
              fontFamily: step === "matched" ? "Fredoka_700Bold" : "Fredoka_600SemiBold",
              color: step === "matched" ? colors.success : colors.onSurface,
              textAlign: "center",
            }}
          >
            {getMessage()}
          </Animated.Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
