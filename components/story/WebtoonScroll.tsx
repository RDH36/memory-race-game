// Reusable letterboxed webtoon scroller — the prelude reading experience
// (title, staged panels, haptic accents, CTA at the end) for any panel list.
import { useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { Btn3D } from "@/components/ui/arcade";
import { haptics } from "@/lib/haptics";
import { StoryPanel } from "@/components/onboarding/StoryPanel";
import type { PreludePanel } from "@/lib/story";

const GAP = 18;
const TITLE_H = 64;

export function WebtoonScroll({
  panels,
  title,
  ctaLabel,
  ctaEmoji = "▶️",
  ctaNote,
  onDone,
}: {
  panels: PreludePanel[];
  title: string;
  ctaLabel: string;
  ctaEmoji?: string;
  /** Small warning under the CTA (e.g. "starting costs 1 ❤️"). */
  ctaNote?: string;
  onDone: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const PANEL_H = Math.round(height * 0.72);
  const STEP = PANEL_H + GAP;
  const viewportH = height - (insets.top + 40) - (insets.bottom + 16);

  const scrollY = useSharedValue(0);
  const activeIdx = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const onPanelChange = (idx: number) => {
    setActiveIndex(idx);
    const effect = panels[idx]?.effect;
    if (effect === "attack") haptics.rumble();
    else if (effect === "blessing" || effect === "portal") haptics.go();
    else haptics.tap();
  };

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
    const idx = Math.min(
      panels.length - 1,
      Math.max(0, Math.round((e.contentOffset.y + PANEL_H * 0.4) / STEP)),
    );
    if (idx !== activeIdx.value) {
      activeIdx.value = idx;
      runOnJS(onPanelChange)(idx);
    }
  });

  return (
    <>
      <View style={{ height: insets.top + 40 }} />
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: insets.bottom + 16 }}
      >
        <View style={{ height: TITLE_H, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 17, color: "#F6F4FF" }}>
            📖 {title}
          </Text>
        </View>

        {panels.map((panel, i) => (
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

        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={{ paddingTop: 6, paddingHorizontal: 6 }}
        >
          <Btn3D color="violet" size="lg" full haptic="press" label={ctaLabel} onPress={onDone}>
            <Text style={{ fontSize: 18 }}>{ctaEmoji}</Text>
          </Btn3D>
          {ctaNote && (
            <Text
              style={{
                fontFamily: "Nunito_600SemiBold",
                fontSize: 12,
                color: "rgba(255,255,255,0.7)",
                textAlign: "center",
                marginTop: 10,
              }}
            >
              {ctaNote}
            </Text>
          )}
        </Animated.View>
      </Animated.ScrollView>
    </>
  );
}
