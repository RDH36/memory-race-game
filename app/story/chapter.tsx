// Chapter hub — the journey timeline. Routes to the current step's screen
// (scene / encounter / battle); shows the outro rewards once all steps end.
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import { Btn3D, Panel, Rise, ScreenHeader } from "@/components/ui/arcade";
import { CHAPTER_1, stepHref, useCampaign } from "@/lib/campaign";
import { StepTimeline } from "@/components/story/StepTimeline";
import { ChapterOutro } from "@/components/story/ChapterOutro";
import { IrisTransition } from "@/components/onboarding/IrisTransition";

export default function ChapterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { stepIndex } = useCampaign();

  const chapter = CHAPTER_1;
  const stepIdx = stepIndex(chapter.id);
  const finished = stepIdx >= chapter.steps.length;
  const current = finished ? null : chapter.steps[stepIdx];

  // Iris-close before navigating to a step, iris-open when arriving here.
  const [pendingNav, setPendingNav] = useState<(() => void) | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleContinue = () => {
    if (!current) return;
    const href = stepHref(chapter, stepIdx);
    if (!href) return;
    setPendingNav(() => () => router.push(href));
  };

  // Replay any completed step (scene, encounter or battle) — the progress
  // cursor is guarded against replays (advanceStep is a no-op for past steps).
  const handleReplay = (index: number) => {
    const href = stepHref(chapter, index);
    if (!href) return;
    setPendingNav(() => () => router.push(href));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title={t("story.chapter1.title")} onBack={() => router.back()} />

        {finished ? (
          <View style={{ gap: 16 }}>
            <ChapterOutro chapter={chapter} />
            {/* The journey stays re-readable after the chapter ends */}
            <Rise delay={260}>
              <Panel background={colors.surfaceContainer} style={{ padding: 18 }}>
                <StepTimeline chapter={chapter} currentIndex={stepIdx} onReplay={handleReplay} />
              </Panel>
            </Rise>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            <Rise delay={60}>
              <Panel background={colors.surfaceContainer} style={{ padding: 18 }}>
                <StepTimeline chapter={chapter} currentIndex={stepIdx} onReplay={handleReplay} />
              </Panel>
            </Rise>

            <Rise delay={160}>
              <Btn3D color="violet" size="lg" full label={t("story.campaign.continue")} onPress={handleContinue}>
                <Text style={{ fontSize: 18 }}>▶️</Text>
              </Btn3D>
            </Rise>
          </View>
        )}
      </ScrollView>

      {/* Iris-in on arrival, iris-out towards the chosen step */}
      {!revealed && <IrisTransition mode="in" duration={900} onDone={() => setRevealed(true)} />}
      {pendingNav && (
        <IrisTransition
          duration={600}
          onDone={() => {
            pendingNav();
            setPendingNav(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}
