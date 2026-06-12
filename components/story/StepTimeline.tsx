// Vertical timeline of a chapter's steps — done / current / locked.
// Completed webtoon scenes stay tappable so the player can re-read them.
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import { haptics } from "@/lib/haptics";
import type { ChapterStep, StoryChapterDef } from "@/lib/campaign";

const STEP_ICONS: Record<ChapterStep["type"], string> = {
  scene: "🎬",
  encounter: "💔",
  skirmish: "⚔️",
  boss: "👹",
};

export function StepTimeline({
  chapter,
  currentIndex,
  onReplay,
}: {
  chapter: StoryChapterDef;
  currentIndex: number;
  /** Called with the step index when a completed scene is tapped. */
  onReplay?: (index: number) => void;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [violet] = colors.hues.violet;
  const [green] = colors.hues.green;

  return (
    <View style={{ gap: 10 }}>
      {chapter.steps.map((step, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        // Every finished step stays replayable — story and games alike
        // (the progress cursor is guarded against replays).
        const replayable = done && !!onReplay;

        const row = (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              opacity: done || current ? 1 : 0.45,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: done ? green : current ? violet : colors.surfaceContainerLow,
              }}
            >
              <Text style={{ fontSize: 18 }}>{done ? "✓" : STEP_ICONS[step.type]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Fredoka_700Bold",
                  fontSize: 14.5,
                  color: colors.onSurface,
                }}
              >
                {t(`story.campaign.steps.${step.id}`)}
              </Text>
              {current && (
                <Text
                  style={{
                    fontFamily: "Nunito_600SemiBold",
                    fontSize: 12,
                    color: colors.onSurfaceMuted,
                  }}
                >
                  {t("story.campaign.currentStep")}
                </Text>
              )}
            </View>
            {!done && !current && <Text style={{ fontSize: 14 }}>🔒</Text>}
            {replayable && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: violet,
                  borderRadius: 14,
                  paddingVertical: 9,
                  paddingHorizontal: 14,
                  boxShadow: `0 3px 0 ${colors.hues.violet[1]}`,
                }}
              >
                <Text style={{ fontSize: 16, color: "#fff" }}>↻</Text>
                <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 13, color: "#fff" }}>
                  {t("story.campaign.replayScene")}
                </Text>
              </View>
            )}
          </View>
        );

        if (!replayable) return <View key={step.id}>{row}</View>;
        return (
          <Pressable
            key={step.id}
            onPress={() => {
              haptics.tap();
              onReplay?.(i);
            }}
            style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}
          >
            {row}
          </Pressable>
        );
      })}
    </View>
  );
}
