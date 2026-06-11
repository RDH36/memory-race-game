import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import type { PreludePanel } from "../../lib/story";
import { ActorEmoji, Particle, SpeechBubble } from "./StoryPanelParts";

type Props = {
  panel: PreludePanel;
  index: number;
  /** Panel top offset inside the scroll content. */
  top: number;
  height: number;
  viewportH: number;
  scrollY: SharedValue<number>;
  /** Hide the panel-number chip (e.g. standalone epilogue panel). */
  hideChip?: boolean;
  /** Run looping animations only while the panel is near the viewport. */
  active?: boolean;
};

export const StoryPanel = memo(function StoryPanel({
  panel,
  index,
  top,
  height,
  viewportH,
  scrollY,
  hideChip,
  active = true,
}: Props) {
  const { t } = useTranslation();

  const particles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        left: (i * 41 + 17) % 100,
        delay: i * 470,
        size: i % 3 === 0 ? 6 : 3,
      })),
    [],
  );

  // Comic-style entrance: the panel fades/slides in as it scrolls into view.
  const entrance = useAnimatedStyle(() => {
    const p = interpolate(
      scrollY.value,
      [top - viewportH * 0.95, top - viewportH * 0.45],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity: p, transform: [{ translateY: (1 - p) * 40 }, { scale: 0.94 + p * 0.06 }] };
  });

  // Subtle parallax on the cast while the panel crosses the screen.
  const parallax = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [top - viewportH, top + height], [26, -26], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          height,
          borderRadius: 26,
          overflow: "hidden",
          borderWidth: 2,
          borderColor: "rgba(255,255,255,0.1)",
        },
        entrance,
      ]}
    >
      <LinearGradient colors={panel.bg} style={StyleSheet.absoluteFill} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />

      {/* Glow halo */}
      <View
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          marginLeft: -130,
          marginTop: -165,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: panel.glow,
          opacity: 0.18,
        }}
      />

      {active &&
        particles.map((p, i) => (
          <Particle key={`${panel.id}-p${i}`} color={panel.glow} left={p.left} delay={p.delay} size={p.size} />
        ))}

      {/* Cast — anchored to the panel center */}
      <Animated.View style={[{ position: "absolute", left: "50%", top: "46%", width: 1, height: 1 }, parallax]}>
        {panel.actors.map((actor, i) => (
          <ActorEmoji key={`${panel.id}-a${i}`} actor={actor} active={active} />
        ))}
        {panel.bubble && <SpeechBubble text={t(panel.bubble.textKey)} x={panel.bubble.x} y={panel.bubble.y} />}
      </Animated.View>

      {/* Panel number chip */}
      {!hideChip && (
        <View
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            width: 28,
            height: 28,
            borderRadius: 9,
            backgroundColor: panel.glow,
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 0 #00000066",
          }}
        >
          <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 14, color: "#101225" }}>{index + 1}</Text>
        </View>
      )}

      {/* Narration caption — webtoon style box */}
      <View
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 14,
          backgroundColor: "rgba(5,6,15,0.74)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.16)",
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      >
        <Text
          style={{
            fontFamily: "Fredoka_600SemiBold",
            fontSize: 15.5,
            color: "#F6F4FF",
            textAlign: "center",
            lineHeight: 23,
          }}
        >
          {t(panel.textKey)}
        </Text>
      </View>
    </Animated.View>
  );
});
