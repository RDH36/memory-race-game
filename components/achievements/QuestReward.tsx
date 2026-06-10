// Reward chip shown on a quest card: gold amount or an ability glyph.
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import type { QuestReward as Reward } from "@/lib/questCatalog";

export function QuestReward({ reward }: { reward: Reward }) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const isGold = reward.kind === "gold";
  const [goldBase, , goldTint] = colors.hues.gold;
  const [violetBase, , violetTint] = colors.hues.violet;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: isGold ? goldTint : violetTint,
        borderRadius: 999,
        paddingVertical: 4,
        paddingHorizontal: 9,
      }}
    >
      <Text style={{ fontSize: 12 }}>{isGold ? "🪙" : reward.emoji}</Text>
      <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 12, color: isGold ? goldBase : violetBase }}>
        {isGold ? `${reward.amount}` : t("achievements.reward.ability")}
      </Text>
    </View>
  );
}
