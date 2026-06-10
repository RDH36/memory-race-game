// Segmented control for the quest tabs (Quotidien / Hebdo / Hauts faits),
// with a small badge showing how many quests are ready to claim per tab.
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import { haptics } from "@/lib/haptics";
import type { QuestType } from "@/lib/questCatalog";

const TAB_LABELS: Record<QuestType, string> = {
  daily: "achievements.tabs.daily",
  weekly: "achievements.tabs.weekly",
  achievement: "achievements.tabs.achievement",
};

export function QuestTabs({
  tabs,
  active,
  onChange,
  claimableCount,
}: {
  tabs: QuestType[];
  active: QuestType;
  onChange: (t: QuestType) => void;
  claimableCount: (t: QuestType) => number;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [accent, accentLip] = colors.hues.violet;

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: 999,
        padding: 4,
        gap: 4,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab === active;
        const badge = claimableCount(tab);
        return (
          <Pressable
            key={tab}
            onPress={() => {
              if (!isActive) {
                haptics.select();
                onChange(tab);
              }
            }}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              paddingVertical: 9,
              borderRadius: 999,
              backgroundColor: isActive ? accent : "transparent",
              boxShadow: isActive ? `0 2px 0 ${accentLip}` : undefined,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontFamily: "Fredoka_700Bold",
                fontSize: 13,
                color: isActive ? "#fff" : colors.onSurfaceVariant,
              }}
            >
              {t(TAB_LABELS[tab])}
            </Text>
            {badge > 0 && (
              <View
                style={{
                  minWidth: 17,
                  height: 17,
                  borderRadius: 999,
                  paddingHorizontal: 4,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isActive ? "#FFFFFF" : colors.hues.coral[0],
                }}
              >
                <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 10, color: isActive ? accent : "#fff" }}>
                  {badge}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
