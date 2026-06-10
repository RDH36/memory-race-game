// Featured one-off quest pinned above the tabs (and shown on Home) to
// motivate the player toward unlocking the Reveal ability. A "?" button
// opens the same ability info modal used on the Builds page.
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import { haptics } from "@/lib/haptics";
import { Btn3D } from "@/components/ui/arcade";
import { getAbility, usePlayerAbilities } from "@/lib/abilities";
import { AbilityInfoModal } from "@/components/builds/AbilityInfoModal";
import type { QuestState } from "@/lib/quests";
import { QuestProgressBar } from "./QuestProgressBar";

export function FeaturedQuest({
  state,
  onClaim,
  onPress,
}: {
  state: QuestState;
  onClaim: () => void;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { states } = usePlayerAbilities();
  const [base, lip, tint] = colors.hues.violet;
  const [infoOpen, setInfoOpen] = useState(false);

  // Feature the rewarded ability itself (glyph + name), not the quest title.
  const reward = state.reward;
  const ability = reward.kind === "ability" ? getAbility(reward.abilityId) : undefined;
  const abilityState = ability ? states.find((s) => s.id === ability.id) : undefined;
  const badgeEmoji = reward.kind === "ability" ? reward.emoji : state.emoji;
  const title = ability
    ? t(`abilities.${ability.nameKey}.name`)
    : t(`achievements.items.${state.id}.title`);

  const openInfo = () => {
    haptics.select();
    setInfoOpen(true);
  };

  const body = (
    <View
      style={{
        backgroundColor: tint,
        borderRadius: 22,
        padding: 16,
        boxShadow: `0 3px 0 ${lip}55`,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 17,
            backgroundColor: base,
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 3px 0 ${lip}`,
          }}
        >
          <Text style={{ fontSize: 30 }}>{badgeEmoji}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 10, letterSpacing: 0.5, color: base }}>
            {t("achievements.featured.eyebrow").toUpperCase()}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 1 }}>
            <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 16, color: colors.onSurface }}>
              {title}
            </Text>
            {abilityState && (
              <Pressable
                onPress={openInfo}
                hitSlop={8}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: colors.surfaceContainer,
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 2px 0 ${lip}55`,
                }}
              >
                <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 12, color: base }}>?</Text>
              </Pressable>
            )}
          </View>
          <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 12, color: colors.onSurfaceMuted, marginTop: 1 }}>
            {t(`achievements.items.${state.id}.description`)}
          </Text>
        </View>

        {state.claimable ? (
          <Btn3D size="sm" color="green" label={t("achievements.claim")} onPress={onClaim} haptic="select" />
        ) : onPress ? (
          <Ionicons name="chevron-forward" size={20} color={base} />
        ) : null}
      </View>

      {!state.met && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 }}>
          <QuestProgressBar value={state.value} target={state.target} done={false} />
          <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 12, color: base }}>
            {Math.min(state.value, state.target)}/{state.target}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <>
      {onPress ? (
        <Pressable onPress={onPress} disabled={state.claimable}>
          {body}
        </Pressable>
      ) : (
        body
      )}
      <AbilityInfoModal
        ability={infoOpen ? abilityState ?? null : null}
        onClose={() => setInfoOpen(false)}
      />
    </>
  );
}
