// Hearts UI for story-campaign games: the balance pill, the in-run mistake
// budget (3 free misses, then each extra miss spends one global heart and the
// game keeps going; out of hearts = defeat) and the shared failure modal
// (a retry costs one heart; out of hearts → shop).
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { usePlayerStats } from "@/lib/playerStats";
import type { MatchResult } from "@/hooks/useLocalGame";

export const MAX_MISTAKES = 3;

/**
 * Counts the player's mismatches. The first MAX_MISTAKES misses are free (the
 * in-run budget hearts). Every miss past the budget calls `onOverBudget` to
 * spend one global ❤️ — if it returns true the game keeps going, if it returns
 * false (no hearts left) `onFail` fires once and the run is lost. A miss
 * absorbed by the shield ability is always free and never counts.
 */
export function useMistakeBudget(
  lastMatchResult: MatchResult,
  shieldCharges: number,
  onOverBudget: () => boolean,
  onFail: () => void,
  enabled = true,
) {
  const [mistakes, setMistakes] = useState(0);
  const [failed, setFailed] = useState(false);
  const mistakesRef = useRef(0);
  const failedRef = useRef(false);
  const prevChargesRef = useRef(shieldCharges);
  const onOverBudgetRef = useRef(onOverBudget);
  const onFailRef = useRef(onFail);
  onOverBudgetRef.current = onOverBudget;
  onFailRef.current = onFail;

  useEffect(() => {
    // Disabled in replay mode: re-reading a cleared step has no stakes.
    if (!enabled) return;
    if (lastMatchResult?.type !== "mismatch" || lastMatchResult.player !== 1) return;
    if (failedRef.current) return;
    const shielded = shieldCharges < prevChargesRef.current;
    if (shielded) return;

    // Side effects stay out of the setState updater so StrictMode's double
    // invocation can't double-spend a heart.
    const next = mistakesRef.current + 1;
    mistakesRef.current = next;
    setMistakes(next);

    // Past the free budget, each miss burns one global heart; none left = defeat.
    if (next > MAX_MISTAKES && !onOverBudgetRef.current()) {
      failedRef.current = true;
      setFailed(true);
      onFailRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMatchResult]);

  useEffect(() => {
    prevChargesRef.current = shieldCharges;
  }, [shieldCharges]);

  const reset = () => {
    failedRef.current = false;
    mistakesRef.current = 0;
    setMistakes(0);
    setFailed(false);
  };
  return { mistakes, failed, reset };
}

/** Row of 3 free-budget hearts dimming with each mistake + rule label. */
export function MistakeHearts({ mistakes }: { mistakes: number }) {
  const { t } = useTranslation();
  const left = Math.max(0, MAX_MISTAKES - mistakes);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 8,
      }}
    >
      {Array.from({ length: MAX_MISTAKES }, (_, i) => (
        <Text key={i} style={{ fontSize: 18, opacity: i < left ? 1 : 0.25 }}>
          ❤️
        </Text>
      ))}
      <Text
        style={{
          fontFamily: "Nunito_600SemiBold",
          fontSize: 12,
          color: "rgba(127,127,127,0.9)",
          marginLeft: 6,
        }}
      >
        {t("story.lives.budget")}
      </Text>
    </View>
  );
}

export function LivesPill({ dark = false }: { dark?: boolean }) {
  const { lives } = usePlayerStats();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
        borderRadius: 999,
        paddingVertical: 5,
        paddingHorizontal: 12,
      }}
    >
      <Text style={{ fontSize: 14 }}>❤️</Text>
      <Text
        style={{ fontFamily: "Fredoka_700Bold", fontSize: 14, color: dark ? "#fff" : "#2A2150" }}
      >
        {lives}
      </Text>
    </View>
  );
}

/**
 * Failure / no-hearts modal. The heart is ALREADY burned by the screen at
 * the moment of defeat (quitting never refunds it) — retrying is free, but
 * starting any new attempt requires at least one heart left.
 */
export function LivesFailModal({
  visible,
  icon,
  title,
  baseMessage,
  freeRetry = false,
  onLeave,
  onRetry,
}: {
  visible: boolean;
  icon: string;
  title: string;
  /** Optional context prepended to the retry message (e.g. boss taunt). */
  baseMessage?: string;
  /** Replay mode: retrying is free — no heart cost, no shop link. */
  freeRetry?: boolean;
  onLeave: () => void;
  onRetry: () => void;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const { lives } = usePlayerStats();
  const outOfLives = !freeRetry && lives <= 0;

  // Replay: low-stakes retry, no heart language at all.
  if (freeRetry) {
    return (
      <ConfirmModal
        visible={visible}
        icon={icon}
        title={title}
        message={baseMessage ?? t("story.lives.replayRetryText")}
        cancelText={t("story.battle.leave")}
        confirmText={t("story.battle.retry")}
        confirmIcon="🔄"
        onCancel={onLeave}
        onConfirm={onRetry}
      />
    );
  }

  const retryText = t("story.lives.retryText", { lives });
  return (
    <ConfirmModal
      visible={visible}
      icon={icon}
      title={title}
      message={
        outOfLives
          ? t("story.lives.noLivesText")
          : baseMessage
            ? `${baseMessage} ${retryText}`
            : retryText
      }
      cancelText={t("story.battle.leave")}
      confirmText={outOfLives ? t("story.lives.getLives") : t("story.lives.retry")}
      confirmIcon={outOfLives ? "🛒" : "❤️"}
      linkText={outOfLives ? undefined : t("story.lives.shopLink")}
      onLink={outOfLives ? undefined : () => router.push("/(tabs)/shop")}
      onCancel={onLeave}
      onConfirm={() => {
        if (outOfLives) {
          router.push("/(tabs)/shop");
          return;
        }
        onRetry();
      }}
    />
  );
}
