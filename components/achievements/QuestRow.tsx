// A quest card: hue badge, title/description, reward chip, progress bar and
// a contextual action (claim button / claimed check / locked value+padlock).
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import { Btn3D, Panel } from "@/components/ui/arcade";
import type { QuestState } from "@/lib/quests";
import { QuestReward } from "./QuestReward";
import { QuestProgressBar } from "./QuestProgressBar";

export function QuestRow({
  state,
  onClaim,
}: {
  state: QuestState;
  onClaim: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [, lip, tint] = colors.hues[state.hue];

  return (
    <Panel style={{ paddingVertical: 14, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 15,
            backgroundColor: tint,
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 3px 0 ${lip}33`,
          }}
        >
          <Text style={{ fontSize: 26 }}>{state.emoji}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
            {t(`achievements.items.${state.id}.title`)}
          </Text>
          <Text style={{ fontSize: 12, fontFamily: "Fredoka_700Bold", color: colors.onSurfaceMuted, marginTop: 1 }}>
            {t(`achievements.items.${state.id}.description`)}
          </Text>
        </View>

        <QuestReward reward={state.reward} />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 }}>
        <QuestProgressBar value={state.value} target={state.target} done={state.met} />

        {state.claimable ? (
          <Btn3D size="sm" color="green" label={t("achievements.claim")} onPress={onClaim} haptic="select" />
        ) : state.claimed ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={{ fontSize: 12, fontFamily: "Fredoka_700Bold", color: colors.success }}>
              {t("achievements.claimed")}
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Text style={{ fontSize: 12, fontFamily: "Fredoka_700Bold", color: colors.onSurfaceVariant }}>
              {Math.min(state.value, state.target)}/{state.target}
            </Text>
            <Ionicons name="lock-closed" size={14} color={colors.onSurfaceMuted} />
          </View>
        )}
      </View>
    </Panel>
  );
}
