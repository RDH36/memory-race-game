// Hearts UI for story-campaign games: the balance pill, the in-run mistake
// budget (more than 3 misses = failed) and the shared failure modal
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
 * Counts the player's mismatches; fires onFail once past the budget.
 * A miss absorbed by the shield ability (charge consumed in the same
 * render) is free — it never burns a budget heart.
 */
export function useMistakeBudget(
  lastMatchResult: MatchResult,
  shieldCharges: number,
  onFail: () => void,
) {
  const [mistakes, setMistakes] = useState(0);
  const failedRef = useRef(false);
  const prevChargesRef = useRef(shieldCharges);
  const onFailRef = useRef(onFail);
  onFailRef.current = onFail;

  useEffect(() => {
    if (lastMatchResult?.type !== "mismatch" || lastMatchResult.player !== 1) return;
    const shielded = shieldCharges < prevChargesRef.current;
    if (shielded) return;
    setMistakes((m) => {
      const next = m + 1;
      if (next > MAX_MISTAKES && !failedRef.current) {
        failedRef.current = true;
        onFailRef.current();
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMatchResult]);

  useEffect(() => {
    prevChargesRef.current = shieldCharges;
  }, [shieldCharges]);

  const reset = () => {
    failedRef.current = false;
    setMistakes(0);
  };
  return { mistakes, failed: mistakes > MAX_MISTAKES, reset };
}

/** Row of 3 hearts dimming with each mistake + "3 erreurs max" label. */
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
  onLeave,
  onRetry,
}: {
  visible: boolean;
  icon: string;
  title: string;
  /** Optional context prepended to the retry message (e.g. boss taunt). */
  baseMessage?: string;
  onLeave: () => void;
  onRetry: () => void;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const { lives } = usePlayerStats();
  const outOfLives = lives <= 0;

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
