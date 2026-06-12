// Webtoon scene player for campaign steps. "Continue" chains directly into
// the next step's screen — the hub is only for resuming and replays.
import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { WebtoonScroll } from "@/components/story/WebtoonScroll";
import { IrisTransition } from "@/components/onboarding/IrisTransition";
import { CHAPTER_1, stepHref, useCampaign } from "@/lib/campaign";
import type { StepHref } from "@/lib/campaign";

const LETTERBOX = "#05060F";

export default function StorySceneScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { step } = useLocalSearchParams<{ step?: string }>();
  const { advanceStep } = useCampaign();

  const stepIdx = Number(step ?? 0);
  const stepDef = CHAPTER_1.steps[stepIdx];
  const panels = stepDef?.type === "scene" ? stepDef.panels : [];

  const [revealed, setRevealed] = useState(false);
  const [exitTo, setExitTo] = useState<StepHref | "back" | null>(null);

  const handleContinue = () => {
    // Always chain into the next step — replaying an old scene replays the
    // journey from there (the cursor guard keeps progress untouched).
    advanceStep(CHAPTER_1, stepIdx);
    setExitTo(stepHref(CHAPTER_1, stepIdx + 1) ?? "back");
  };

  return (
    <View style={{ flex: 1, backgroundColor: LETTERBOX }}>
      <StatusBar style="light" />

      <WebtoonScroll
        panels={panels}
        title={t("story.chapter1.title")}
        ctaLabel={t("story.campaign.continue")}
        onDone={handleContinue}
      />

      {/* Iris-in on arrival, iris-out towards the next step (or the hub) */}
      {!revealed && <IrisTransition mode="in" duration={1100} onDone={() => setRevealed(true)} />}
      {exitTo && (
        <IrisTransition
          duration={600}
          onDone={() => (exitTo === "back" ? router.back() : router.replace(exitTo))}
        />
      )}
    </View>
  );
}
