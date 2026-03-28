import { useCallback, useEffect, useRef, useState } from "react";
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

const EMOJIS = ["🐶", "🦊", "🐶", "🦊"];
const GRID_ORDER = [0, 1, 2, 3]; // 2x2

const AnimatedView = Animated.createAnimatedComponent(View);

function MiniCard({
  emoji,
  isFaceUp,
  isMatched,
  onPress,
  disabled,
}: {
  emoji: string;
  isFaceUp: boolean;
  isMatched: boolean;
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
    if (isMatched) {
      scale.value = withSequence(
        withSpring(1.12, { damping: 6, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 200 }),
      );
    }
  }, [isMatched]);

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
    <Pressable onPress={onPress} disabled={disabled} style={{ width: "46%", aspectRatio: 0.85 }}>
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
          <Text style={{ fontSize: 24, fontFamily: "Fredoka_700Bold", color: colors.p1 }}>?</Text>
        </AnimatedView>
        <AnimatedView
          style={[
            frontStyle,
            {
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              backgroundColor: isMatched ? colors.successBg : colors.surfaceContainer,
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: isMatched ? 2 : 0,
              borderColor: isMatched ? colors.success + "55" : "transparent",
            },
          ]}
        >
          <Text style={{ fontSize: 32 }}>{emoji}</Text>
        </AnimatedView>
      </View>
    </Pressable>
  );
}

export default function MatchScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [faceUp, setFaceUp] = useState<Set<number>>(new Set());
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<number[]>([]);
  const [allDone, setAllDone] = useState(false);
  const lockRef = useRef(false);

  const handleTap = useCallback(
    (index: number) => {
      if (lockRef.current || faceUp.has(index) || matched.has(index)) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const nextFaceUp = new Set(faceUp);
      nextFaceUp.add(index);
      setFaceUp(nextFaceUp);

      const nextSelected = [...selected, index];
      setSelected(nextSelected);

      if (nextSelected.length === 2) {
        lockRef.current = true;
        const [a, b] = nextSelected;

        if (EMOJIS[a] === EMOJIS[b]) {
          // Match!
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          const nextMatched = new Set(matched);
          nextMatched.add(a);
          nextMatched.add(b);
          setMatched(nextMatched);
          setSelected([]);
          lockRef.current = false;

          if (nextMatched.size >= 2) {
            setAllDone(true);
          }
        } else {
          // Mismatch — flip back
          setTimeout(() => {
            const reset = new Set(nextFaceUp);
            reset.delete(a);
            reset.delete(b);
            setFaceUp(reset);
            setSelected([]);
            lockRef.current = false;
          }, 800);
        }
      }
    },
    [faceUp, matched, selected],
  );

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/onboarding/tornado");
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
                width: i === 2 ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i <= 2 ? colors.primaryContainer : colors.primaryContainerBg,
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
              color: colors.onSurface,
              textAlign: "center",
            }}
          >
            {allDone ? t("onboarding.match.bravo") : t("onboarding.match.title")}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Nunito_400Regular",
              color: colors.onSurfaceVariant,
              textAlign: "center",
              marginTop: 6,
            }}
          >
            {allDone
              ? t("onboarding.match.allFound")
              : t("onboarding.match.subtitle")}
          </Text>
        </Animated.View>

        {/* Grid */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 12,
              maxWidth: 260,
            }}
          >
            {GRID_ORDER.map((idx) => (
              <MiniCard
                key={idx}
                emoji={EMOJIS[idx]}
                isFaceUp={faceUp.has(idx) || matched.has(idx)}
                isMatched={matched.has(idx)}
                onPress={() => handleTap(idx)}
                disabled={lockRef.current || matched.has(idx) || faceUp.has(idx)}
              />
            ))}
          </View>
        </Animated.View>

        {/* CTA */}
        {allDone && (
          <Animated.View entering={FadeInDown.duration(500)} style={{ paddingBottom: 24 }}>
            <Pressable
              onPress={handleContinue}
              style={{
                backgroundColor: colors.primaryContainer,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Fredoka_600SemiBold",
                  color: "#FFFFFF",
                }}
              >
                {t("onboarding.match.cta")} →
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}
