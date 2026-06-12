// Memory-healing encounter — the meeting told as a webtoon, then the real
// flip-card game (CardItem + sounds). More than 3 mistakes = failed; a
// retry costs one heart ❤️ (earned per chapter, or bought in the shop).
import { useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { Btn3D } from "@/components/ui/arcade";
import { WebtoonScroll } from "@/components/story/WebtoonScroll";
import { HealingGrid } from "@/components/story/HealingGrid";
import { LivesPill, LivesFailModal } from "@/components/story/lives";
import { IrisTransition } from "@/components/onboarding/IrisTransition";
import { usePlayerStats } from "@/lib/playerStats";
import { CHAPTER_1, stepHref, useCampaign } from "@/lib/campaign";
import type { StepHref } from "@/lib/campaign";

const LETTERBOX = "#05060F";

export default function EncounterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { step } = useLocalSearchParams<{ step?: string }>();
  const { advanceStep } = useCampaign();
  const { lives, spendLife } = usePlayerStats();

  const stepIdx = Number(step ?? 0);
  const stepDef = CHAPTER_1.steps[stepIdx];
  const encounter = stepDef?.type === "encounter" ? stepDef : null;

  // story → game → outro (victory card); fail opens the retry modal.
  const [phase, setPhase] = useState<"story" | "game" | "outro">("story");
  const [won, setWon] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [showNoHearts, setShowNoHearts] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [exitTo, setExitTo] = useState<StepHref | "back" | null>(null);

  // Victory story card first — never straight into the next step.
  const handleContinue = () => {
    advanceStep(CHAPTER_1, stepIdx);
    setPhase("outro");
  };

  // Every attempt is PAID upfront (1 ❤️) — quitting never refunds it.
  const startGame = (): boolean => {
    if (!spendLife()) {
      setShowNoHearts(true);
      return false;
    }
    return true;
  };

  // A retry is a fresh attempt — it costs a heart again.
  const handleRetry = () => {
    if (!startGame()) return;
    setShowFailModal(false);
    setResetNonce((n) => n + 1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: LETTERBOX }}>
      <StatusBar style="light" />

      {phase !== "game" ? (
        <WebtoonScroll
          panels={(phase === "outro" ? encounter?.outroPanels : encounter?.panels) ?? []}
          title={t("story.chapter1.title")}
          ctaLabel={
            phase === "outro"
              ? t("story.campaign.continue")
              : `${t("story.chapter1.tomir.cta")} (1 ❤️)`
          }
          ctaEmoji={phase === "outro" ? "▶️" : "💖"}
          ctaNote={phase === "outro" ? undefined : t("story.lives.startCost", { lives })}
          // Intro: starting the healing charges the heart upfront.
          // Outro (memory restored): continue towards the next step.
          onDone={() => {
            if (phase === "outro") setExitTo(stepHref(CHAPTER_1, stepIdx + 1) ?? "back");
            else if (startGame()) setPhase("game");
          }}
        />
      ) : (
        <View style={{ flex: 1, paddingTop: insets.top + 20 }}>
          {/* Hearts balance */}
          <View style={{ alignItems: "flex-end", paddingHorizontal: 20 }}>
            <LivesPill dark />
          </View>

          {/* NPC + speech bubble */}
          <View style={{ alignItems: "center", paddingHorizontal: 24, gap: 12 }}>
            <Animated.Text entering={ZoomIn.duration(420)} style={{ fontSize: 60 }}>
              {won ? "🥹" : encounter?.npcEmoji ?? "👴"}
            </Animated.Text>
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 18,
                paddingVertical: 12,
                paddingHorizontal: 16,
                maxWidth: 320,
              }}
            >
              <Text
                style={{
                  fontFamily: "Nunito_600SemiBold",
                  fontSize: 14.5,
                  color: "#2A2150",
                  textAlign: "center",
                }}
              >
                {won ? t(encounter?.successKey ?? "") : t(encounter?.introKey ?? "")}
              </Text>
            </View>
          </View>

          {/* The real flip-card game */}
          <View style={{ flex: 1, justifyContent: "center" }}>
            <HealingGrid
              cardEmojis={encounter?.cardEmojis ?? ["🏡", "👧", "🍞"]}
              resetNonce={resetNonce}
              onWin={() => setWon(true)}
              onFail={() => setShowFailModal(true)}
            />
          </View>

          {/* Continue once the memory is restored */}
          <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 20, minHeight: 110 }}>
            {won && (
              <Animated.View entering={FadeInDown.delay(300).duration(450)}>
                <Btn3D
                  color="green"
                  size="lg"
                  full
                  haptic="press"
                  label={t("story.campaign.continue")}
                  onPress={handleContinue}
                >
                  <Text style={{ fontSize: 18 }}>💖</Text>
                </Btn3D>
              </Animated.View>
            )}
          </View>
        </View>
      )}

      {/* Failed (heart already burned) or trying to start without hearts */}
      <LivesFailModal
        visible={showFailModal}
        icon="💔"
        title={t("story.lives.failTitle")}
        onLeave={() => {
          setShowFailModal(false);
          router.back();
        }}
        onRetry={handleRetry}
      />
      <LivesFailModal
        visible={showNoHearts}
        icon="💔"
        title={t("story.lives.noHeartsTitle")}
        onLeave={() => { setShowNoHearts(false); router.back(); }}
        onRetry={() => { if (startGame()) { setShowNoHearts(false); setPhase("game"); } }}
      />

      {!revealed && <IrisTransition mode="in" duration={1000} onDone={() => setRevealed(true)} />}
      {exitTo && (
        <IrisTransition
          duration={600}
          onDone={() => (exitTo === "back" ? router.back() : router.replace(exitTo))}
        />
      )}
    </View>
  );
}
