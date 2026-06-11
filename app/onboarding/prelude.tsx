import { useEffect, useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import Animated, {
  Easing,
  FadeInDown,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Btn3D } from "@/components/ui/arcade";
import { haptics } from "../../lib/haptics";
import { PRELUDE_PANELS } from "../../lib/story";
import { StoryPanel } from "../../components/onboarding/StoryPanel";
import { IrisTransition } from "../../components/onboarding/IrisTransition";

const LETTERBOX = "#05060F";
const GAP = 18;
const TITLE_H = 64;

function ScrollHint({ text }: { text: string }) {
  const pulse = useSharedValue(0.35);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 850, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 850, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View style={[{ alignItems: "center" }, style]} pointerEvents="none">
      <Text style={{ fontSize: 12.5, fontFamily: "Nunito_600SemiBold", color: "rgba(255,255,255,0.8)" }}>
        {text}
      </Text>
      <Text style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", marginTop: -2 }}>⌄</Text>
    </Animated.View>
  );
}

export default function PreludeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  // Replay mode (launched from home): skip the tutorial, go straight to the
  // fight, and never route towards sign-up.
  const { replay } = useLocalSearchParams<{ replay?: string }>();
  const isReplay = replay === "1";

  const PANEL_H = Math.round(height * 0.72);
  const STEP = PANEL_H + GAP;
  const viewportH = height - (insets.top + 40) - (insets.bottom + 16);

  const scrollY = useSharedValue(0);
  const activeIdx = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Each panel lands with its own Pulsar accent as it scrolls into view.
  // The active index also gates loop animations to nearby panels only.
  const onPanelChange = (idx: number) => {
    setActiveIndex(idx);
    const effect = PRELUDE_PANELS[idx]?.effect;
    if (effect === "attack") haptics.rumble();
    else if (effect === "blessing" || effect === "portal") haptics.go();
    else haptics.tap();
    if (idx >= PRELUDE_PANELS.length - 1) setReachedEnd(true);
  };

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
    const idx = Math.min(
      PRELUDE_PANELS.length - 1,
      Math.max(0, Math.round((e.contentOffset.y + PANEL_H * 0.4) / STEP)),
    );
    if (idx !== activeIdx.value) {
      activeIdx.value = idx;
      runOnJS(onPanelChange)(idx);
    }
  });

  // "First step" goes straight into the Gromak battle — the tutorial lives
  // inside the fight itself (tooltips + hand pointer), no separate steps.
  const handleStart = async () => {
    if (isReplay) {
      router.push({ pathname: "/onboarding/battle", params: { replay: "1" } });
      return;
    }
    await AsyncStorage.setItem("onboarding_complete", "true");
    router.push("/onboarding/battle");
  };

  const handleSkip = async () => {
    haptics.tap();
    if (isReplay) {
      router.back();
      return;
    }
    await AsyncStorage.setItem("onboarding_complete", "true");
    router.replace("/auth");
  };

  return (
    <View style={{ flex: 1, backgroundColor: LETTERBOX }}>
      <StatusBar style="light" />

      {/* Top letterbox bar + skip */}
      <View
        style={{
          height: insets.top + 40,
          justifyContent: "flex-end",
          alignItems: "flex-end",
          paddingHorizontal: 16,
          paddingBottom: 6,
        }}
      >
        <Pressable onPress={handleSkip} hitSlop={10}>
          <Text style={{ fontSize: 14, fontFamily: "Nunito_600SemiBold", color: "rgba(255,255,255,0.5)" }}>
            {t("onboarding.skip")}
          </Text>
        </Pressable>
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: insets.bottom + 16 }}
      >
        {/* Chapter title */}
        <View style={{ height: TITLE_H, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 17, color: "#F6F4FF" }}>
            📖 {t("story.prelude.chapterTitle")}
          </Text>
        </View>

        {PRELUDE_PANELS.map((panel, i) => (
          <View key={panel.id} style={{ marginBottom: GAP }}>
            <StoryPanel
              panel={panel}
              index={i}
              top={TITLE_H + i * STEP}
              height={PANEL_H}
              viewportH={viewportH}
              scrollY={scrollY}
              active={Math.abs(i - activeIndex) <= 1}
            />
          </View>
        ))}

        {/* End of chapter — call to adventure */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ paddingTop: 6, paddingHorizontal: 6 }}>
          <Btn3D
            color="violet"
            size="lg"
            full
            haptic="press"
            label={t("story.prelude.cta")}
            onPress={handleStart}
          >
            <Text style={{ fontSize: 18, color: "#fff" }}>⚔️</Text>
          </Btn3D>
        </Animated.View>
      </Animated.ScrollView>

      {/* Scroll hint — hidden once the last panel is reached */}
      {!reachedEnd && (
        <View style={{ position: "absolute", bottom: insets.bottom + 14, left: 0, right: 0, alignItems: "center" }}>
          <ScrollHint text={t("story.prelude.scroll")} />
        </View>
      )}

      {/* Iris-in: the story opens out of the darkness left by the welcome screen */}
      {!revealed && <IrisTransition mode="in" duration={1300} onDone={() => setRevealed(true)} />}
    </View>
  );
}
