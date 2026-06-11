// Guided tutorial for the Gromak onboarding battle — popular-mobile-game
// style: the hand walks the player through the first two pairs card by
// card, then play opens up. Also owns the battle tooltip banner.
import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";
import { HandPointer } from "./HandPointer";

export type TooltipData = { text: string; type: "info" | "success" | "error"; key: number };

// Pre-shuffled 2x4 tutorial grid — 4 pairs.
export const EMOJIS = ["🐶", "🦊", "🐸", "🐱", "🐱", "🐶", "🐸", "🦊"];
export const TOTAL_PAIRS = 4;

// First two pairs of the pre-shuffled grid: 🐶 at 0 & 5, 🦊 at 1 & 7.
const GUIDE_SEQUENCE = [0, 5, 1, 7];

/** The tutorial bot deliberately MISSES: it picks two non-matching cards
 *  whenever possible, so the player always wins. */
export function pickScriptedCpuCards(matchedBy: number[]): [number, number] | null {
  const available = EMOJIS.map((_, i) => i).filter((i) => matchedBy[i] === -1);
  if (available.length < 2) return null;
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  const first = shuffled[0];
  const mismatch = shuffled.find((j) => j !== first && EMOJIS[j] !== EMOJIS[first]);
  const second = mismatch ?? available.find((j) => j !== first);
  return second === undefined ? null : [first, second];
}

export function BattleTooltip({ text, type }: { text: string; type: TooltipData["type"] }) {
  const { colors } = useTheme();
  const hue =
    type === "success" ? colors.hues.green : type === "error" ? colors.hues.coral : colors.hues.violet;
  const [c, cd] = hue;
  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      style={{
        backgroundColor: c,
        borderRadius: 18,
        paddingHorizontal: 24,
        paddingVertical: 14,
        alignSelf: "stretch",
        marginHorizontal: 4,
        boxShadow: `0 4px 0 ${cd}`,
      }}
    >
      <Text style={{ color: "#FFF", fontFamily: "Fredoka_700Bold", fontSize: 18, textAlign: "center" }}>{text}</Text>
    </Animated.View>
  );
}

/** Tap-here finger anchored on a specific card of the 4-column grid. */
export function GuideHand({ target, cardSize }: { target: number; cardSize: number }) {
  const col = target % 4;
  const row = Math.floor(target / 4);
  return (
    <HandPointer
      pointing="up"
      style={{
        left: col * (cardSize + 8) + cardSize - 40,
        top: row * (cardSize + 8) + cardSize - 34,
        zIndex: 10,
      }}
    />
  );
}

export function useBattleTutorial(isReplay: boolean, lockedRef: MutableRefObject<boolean>) {
  const { t } = useTranslation();
  const [tooltip, setTooltip] = useState<TooltipData>({ text: "", type: "info", key: 0 });
  const keyRef = useRef(0);
  const [guideStep, setGuideStep] = useState<number | null>(null);
  const guideRef = useRef<number | null>(null);
  const finishedRef = useRef(false);

  const showTooltip = useCallback((text: string, type: TooltipData["type"]) => {
    keyRef.current += 1;
    setTooltip({ text, type, key: keyRef.current });
  }, []);

  // Story beat: Gromak taunts the hero, then the guided steps begin
  // (first run) or play opens straight up (replay).
  useEffect(() => {
    lockedRef.current = true;
    showTooltip(t("story.brigadeChief.intro"), "error");
    const timer = setTimeout(() => {
      lockedRef.current = false;
      if (isReplay) {
        showTooltip(t("onboarding.battle.yourTurn"), "info");
      } else {
        guideRef.current = 0;
        setGuideStep(0);
        showTooltip(t("onboarding.battle.guideFlip"), "info");
      }
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  /** True when the tap must be swallowed (guided mode, not the target card). */
  const blocksCard = useCallback(
    (cardId: number) => guideRef.current !== null && cardId !== GUIDE_SEQUENCE[guideRef.current],
    [],
  );

  /** Advance the guide after the target card was flipped. */
  const onCardFlipped = useCallback(() => {
    if (guideRef.current === null) return;
    const next = guideRef.current + 1;
    if (next >= GUIDE_SEQUENCE.length) {
      guideRef.current = null;
      setGuideStep(null);
      finishedRef.current = true;
      return;
    }
    guideRef.current = next;
    setGuideStep(next);
    if (next === 1 || next === 3) showTooltip(t("onboarding.battle.guideMatch"), "info");
  }, [showTooltip, t]);

  /** Follow-up message after a player match while the guide is running. */
  const onPlayerMatch = useCallback(() => {
    if (guideRef.current === 2) {
      setTimeout(() => showTooltip(t("onboarding.battle.guidePair2"), "info"), 1100);
    } else if (finishedRef.current) {
      finishedRef.current = false;
      setTimeout(() => showTooltip(t("onboarding.battle.freePlay"), "info"), 1100);
    }
  }, [showTooltip, t]);

  const guideTarget = guideStep !== null ? GUIDE_SEQUENCE[guideStep] : null;

  return { tooltip, showTooltip, blocksCard, onCardFlipped, onPlayerMatch, guideTarget };
}
