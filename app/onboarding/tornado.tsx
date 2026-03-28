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
  withSequence,
  interpolate,
} from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";
import { TornadoOverlay } from "../../components/game/TornadoOverlay";
import { ActionBar } from "../../components/game/ActionBar";

const INITIAL_EMOJIS = ["🐱", "🦁", "🐸", "🐱", "🦁", "🐸"];
const SHUFFLED_EMOJIS = ["🦁", "🐸", "🐱", "🐸", "🐱", "🦁"];

const AnimatedView = Animated.createAnimatedComponent(View);

function GridCard({
  emoji,
  isFaceUp,
  shuffling,
}: {
  emoji: string;
  isFaceUp: boolean;
  shuffling: boolean;
}) {
  const { colors } = useTheme();
  const rotateY = useSharedValue(0);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    rotateY.value = withTiming(isFaceUp ? 180 : 0, { duration: 320 });
  }, [isFaceUp]);

  useEffect(() => {
    if (shuffling) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(-3, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      );
    }
  }, [shuffling]);

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeX.value },
      { rotateY: `${interpolate(rotateY.value, [0, 180], [0, 180])}deg` },
    ],
  }));

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeX.value },
      { rotateY: `${interpolate(rotateY.value, [0, 180], [180, 360])}deg` },
    ],
  }));

  return (
    <View style={{ width: "30%", aspectRatio: 0.85 }}>
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
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <Text style={{ fontSize: 20, fontFamily: "Fredoka_700Bold", color: colors.p1 }}>?</Text>
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
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <Text style={{ fontSize: 26 }}>{emoji}</Text>
        </AnimatedView>
      </View>
    </View>
  );
}

export default function TornadoScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [phase, setPhase] = useState<"intro" | "ready" | "animating" | "done">("intro");
  const [shuffling, setShuffling] = useState(false);
  const [emojis, setEmojis] = useState(INITIAL_EMOJIS);
  const [showOverlay, setShowOverlay] = useState(false);

  // Briefly show cards face-up at start, then flip them down
  const [revealPhase, setRevealPhase] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealPhase(false);
      setPhase("ready");
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleTornado = () => {
    if (phase !== "ready") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setPhase("animating");
    setShowOverlay(true);

    // Shuffle cards during the overlay animation
    setTimeout(() => {
      setShuffling(true);
      setEmojis(SHUFFLED_EMOJIS);
      setTimeout(() => setShuffling(false), 400);
    }, 2000);
  };

  const handleOverlayComplete = () => {
    setShowOverlay(false);
    setPhase("done");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/onboarding/ready");
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
                width: i === 3 ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i <= 3 ? colors.primaryContainer : colors.primaryContainerBg,
              }}
            />
          ))}
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ marginTop: 32 }}>
          <Text
            style={{
              fontSize: 26,
              fontFamily: "Fredoka_700Bold",
              color: phase === "done" ? colors.success : colors.onSurface,
              textAlign: "center",
            }}
          >
            {phase === "done" ? t("onboarding.tornado.wow") : t("onboarding.tornado.title")}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Nunito_400Regular",
              color: colors.onSurfaceVariant,
              textAlign: "center",
              marginTop: 8,
              lineHeight: 20,
              paddingHorizontal: 8,
            }}
          >
            {phase === "done" ? t("onboarding.tornado.detail") : t("onboarding.tornado.subtitle")}
          </Text>
        </Animated.View>

        {/* Grid */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 10,
              maxWidth: 280,
            }}
          >
            {emojis.map((emoji, idx) => (
              <GridCard
                key={`${idx}-${emoji}`}
                emoji={emoji}
                isFaceUp={revealPhase}
                shuffling={shuffling}
              />
            ))}
          </View>

          {/* Hint text when ready */}
          {phase === "ready" && (
            <Animated.Text
              entering={FadeInDown.delay(200).duration(400)}
              style={{
                fontSize: 13,
                fontFamily: "Nunito_600SemiBold",
                color: colors.onSurfaceVariant,
                textAlign: "center",
                marginTop: 24,
              }}
            >
              {t("onboarding.tornado.hint")}
            </Animated.Text>
          )}
        </Animated.View>

        {/* ActionBar (real game component) or CTA */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)} style={{ paddingBottom: 24 }}>
          {phase === "done" ? (
            <Pressable
              onPress={handleContinue}
              style={{
                backgroundColor: colors.primaryContainer,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, fontFamily: "Fredoka_600SemiBold", color: "#FFFFFF" }}>
                {t("onboarding.tornado.cta")} →
              </Text>
            </Pressable>
          ) : (
            <ActionBar
              canUseTornado={phase === "ready"}
              tornadoUsed={false}
              onTornado={handleTornado}
            />
          )}
        </Animated.View>
      </View>

      {/* Real tornado overlay animation */}
      {showOverlay && <TornadoOverlay onComplete={handleOverlayComplete} />}
    </SafeAreaView>
  );
}
