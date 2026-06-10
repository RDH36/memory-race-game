import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/ThemeContext";
import { haptics } from "../../lib/haptics";
import { useQuests } from "../../lib/quests";
import { QUEST_TYPES, type QuestType } from "../../lib/questCatalog";
import {
  formatResetTime,
  msUntilDailyReset,
  msUntilWeeklyReset,
} from "../../lib/questPeriods";
import { Rise } from "@/components/ui/arcade";
import { QuestTabs } from "@/components/achievements/QuestTabs";
import { QuestRow } from "@/components/achievements/QuestRow";
import { FeaturedQuest } from "@/components/achievements/FeaturedQuest";
import { FEATURED_QUEST_ID } from "../../lib/questCatalog";

export default function AchievementsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { states, claim, claimableCount, featured } = useQuests();

  const [tab, setTab] = useState<QuestType>("daily");
  const [, setTick] = useState(0);

  // Tick once a minute so the reset countdown stays fresh.
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const handleClaim = (id: string) => {
    if (claim(id)) haptics.coin();
  };

  const resetLabel =
    tab === "daily"
      ? formatResetTime(msUntilDailyReset())
      : tab === "weekly"
        ? formatResetTime(msUntilWeeklyReset())
        : null;

  const visible = states.filter((s) => s.type === tab && s.id !== FEATURED_QUEST_ID);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <Text style={{ fontSize: 28, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
            {t("achievements.title")}
          </Text>
          {resetLabel && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: colors.surfaceContainerLow,
                borderRadius: 999,
                paddingVertical: 6,
                paddingHorizontal: 11,
              }}
            >
              <Text style={{ fontSize: 12 }}>⏱️</Text>
              <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 12, color: colors.onSurfaceVariant }}>
                {t("achievements.resetIn", { time: resetLabel })}
              </Text>
            </View>
          )}
        </View>
        <Text style={{ fontSize: 13, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginBottom: 16 }}>
          {t("achievements.subtitle")}
        </Text>

        {featured && !featured.claimed && (
          <Rise delay={20}>
            <View style={{ marginBottom: 18 }}>
              <FeaturedQuest state={featured} onClaim={() => handleClaim(featured.id)} />
            </View>
          </Rise>
        )}

        <QuestTabs
          tabs={QUEST_TYPES}
          active={tab}
          onChange={setTab}
          claimableCount={claimableCount}
        />

        <View style={{ gap: 11, marginTop: 18 }}>
          {visible.map((state, i) => (
            <Rise key={state.id} delay={i * 45}>
              <QuestRow state={state} onClaim={() => handleClaim(state.id)} />
            </Rise>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
