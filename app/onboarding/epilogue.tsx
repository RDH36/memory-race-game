import { useEffect, useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
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
import { BELIC_LOSE, BELIC_WIN, EPILOGUE_ENCOURAGE, EPILOGUE_LOSE, EPILOGUE_WIN } from "../../lib/storyEpilogue";
import { StoryPanel } from "../../components/onboarding/StoryPanel";
import { ConfettiParticles } from "../../components/result/ConfettiParticles";

const LETTERBOX = "#05060F";
const GAP = 18;
const TITLE_H = 56;

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

export default function EpilogueScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { result, replay } = useLocalSearchParams<{ result?: string; replay?: string }>();
  const isReplay = replay === "1";

  const won = result === "won";
  // Win: Belic snatches the beaten Gromak, then the village celebrates and
  // invites you to the Guild. Loss: the Lion saves you, Belic carries Gromak
  // away all the same, then the villagers cheer you on to join the Guild.
  const sequence = won ? [BELIC_WIN, EPILOGUE_WIN] : [EPILOGUE_LOSE, BELIC_LOSE, EPILOGUE_ENCOURAGE];

  const PANEL_H = Math.round(height * 0.72);
  const STEP = PANEL_H + GAP;
  const viewportH = height - (insets.top + 10 + TITLE_H) - (insets.bottom + 16);

  const scrollY = useSharedValue(0);
  const activeIdx = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reachedEnd, setReachedEnd] = useState(false);

  // Peak-end juice, straight from the battle (no score screen in between).
  useEffect(() => {
    if (won) haptics.win();
    else if (result === "draw") haptics.draw();
    else haptics.lose();
  }, []);

  const onPanelChange = (idx: number) => {
    setActiveIndex(idx);
    const effect = sequence[idx]?.effect;
    if (effect === "attack") haptics.rumble();
    else if (effect === "blessing") haptics.go();
    else haptics.tap();
    if (idx >= sequence.length - 1) setReachedEnd(true);
  };

  const lastIndex = sequence.length - 1;
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
    const idx = Math.min(lastIndex, Math.max(0, Math.round((e.contentOffset.y + PANEL_H * 0.4) / STEP)));
    if (idx !== activeIdx.value) {
      activeIdx.value = idx;
      runOnJS(onPanelChange)(idx);
    }
  });

  // Joining the village Memory Guild = creating your account. Replaying the
  // story from home ends back at the village (home) — never sign-up again.
  const handleJoin = async () => {
    if (isReplay) {
      router.replace("/(tabs)");
      return;
    }
    await AsyncStorage.setItem("onboarding_complete", "true");
    router.replace("/auth");
  };

  return (
    <View style={{ flex: 1, backgroundColor: LETTERBOX, paddingTop: insets.top + 10 }}>
      <StatusBar style="light" />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: insets.bottom + 16 }}
      >
        {/* Chapter title */}
        <View style={{ height: TITLE_H, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 17, color: "#F6F4FF" }}>
            📖 {t("story.epilogue.title")}
          </Text>
        </View>

        {sequence.map((panel, i) => (
          <View key={panel.id} style={{ marginBottom: GAP }}>
            <StoryPanel
              panel={panel}
              index={i}
              top={TITLE_H + i * STEP}
              height={PANEL_H}
              viewportH={viewportH}
              scrollY={scrollY}
              hideChip
              active={Math.abs(i - activeIndex) <= 1}
            />
            {won && i === lastIndex && reachedEnd && (
              <View pointerEvents="none" style={{ position: "absolute", top: "30%", alignSelf: "center" }}>
                <ConfettiParticles />
              </View>
            )}
          </View>
        ))}

        {/* End of chapter — join the Memory Guild */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ paddingTop: 6, paddingHorizontal: 6 }}>
          <Btn3D
            color="gold"
            size="lg"
            full
            haptic="press"
            label={t(isReplay ? "story.epilogue.ctaReplay" : "story.epilogue.cta")}
            onPress={handleJoin}
          >
            <Text style={{ fontSize: 18 }}>🛡️</Text>
          </Btn3D>
        </Animated.View>
      </Animated.ScrollView>

      {/* Scroll hint — hidden once the last panel is reached */}
      {!reachedEnd && (
        <View style={{ position: "absolute", bottom: insets.bottom + 14, left: 0, right: 0, alignItems: "center" }}>
          <ScrollHint text={t("story.prelude.scroll")} />
        </View>
      )}
    </View>
  );
}
