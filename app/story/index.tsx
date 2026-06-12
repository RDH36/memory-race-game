// Campaign map — chapter list, gold balance and the next-chapter teaser.
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import { Btn3D, CoinBar, Panel, Ribbon, Rise, ScreenHeader } from "@/components/ui/arcade";
import { ChoiceRow } from "@/components/mode/arcade/ChoiceRow";
import { IrisTransition } from "@/components/onboarding/IrisTransition";
import { CHAPTER_1, NEXT_CHAPTER_TEASER, isChapterCompleted, useCampaign } from "@/lib/campaign";

export default function CampaignMapScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { progress, gold, stepIndex } = useCampaign();
  const [opening, setOpening] = useState(false);

  const stepIdx = stepIndex(CHAPTER_1.id);
  const total = CHAPTER_1.steps.length;
  const done = isChapterCompleted(progress, CHAPTER_1.id) || stepIdx >= total;
  const started = stepIdx > 0;

  const ctaLabel = done
    ? t("story.campaign.completed")
    : started
      ? t("story.campaign.continue")
      : t("story.campaign.start");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={t("story.campaign.title")}
          onBack={() => router.back()}
          right={<CoinBar icon="🪙" value={gold} />}
        />

        {/* Chapter 1 — La Route des Cendres */}
        <Rise delay={60}>
          <Panel background={colors.surfaceContainer} style={{ padding: 18, gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text style={{ fontSize: 40 }}>🦊</Text>
              <View style={{ flex: 1 }}>
                <Ribbon color={done ? "green" : "violet"}>
                  {done ? `✓ ${t("story.campaign.completed")}` : t("story.campaign.chapterLabel")}
                </Ribbon>
                <Text
                  style={{
                    fontFamily: "Fredoka_700Bold",
                    fontSize: 18,
                    color: colors.onSurface,
                    marginTop: 6,
                  }}
                >
                  {t("story.chapter1.title")}
                </Text>
                {!done && (
                  <Text
                    style={{
                      fontFamily: "Nunito_600SemiBold",
                      fontSize: 12.5,
                      color: colors.onSurfaceMuted,
                      marginTop: 2,
                    }}
                  >
                    {t("story.campaign.stepProgress", { current: Math.min(stepIdx + 1, total), total })}
                  </Text>
                )}
              </View>
            </View>
            <Btn3D
              color={done ? "green" : "violet"}
              size="md"
              full
              label={ctaLabel}
              onPress={() => setOpening(true)}
            >
              <Text style={{ fontSize: 16 }}>{done ? "🏅" : "⚔️"}</Text>
            </Btn3D>
          </Panel>
        </Rise>

        {/* Chapter 2 teaser — paid unlock, ships in a later update */}
        <View style={{ marginTop: 14 }}>
          <ChoiceRow
            icon="🐳"
            title={t("story.campaign.chapter2Title")}
            desc={t("story.campaign.unlockCost", { cost: NEXT_CHAPTER_TEASER.unlockCost })}
            color="blue"
            badge={t("story.campaign.soon")}
            locked
            delay={160}
          />
        </View>

        {/* Replay the webtoon prelude */}
        <View style={{ marginTop: 14 }}>
          <ChoiceRow
            icon="📖"
            title={t("story.campaign.replayPrelude")}
            desc={t("story.prelude.chapterTitle")}
            color="gold"
            delay={240}
            onPress={() =>
              router.push({ pathname: "/onboarding/prelude", params: { replay: "1" } })
            }
          />
        </View>
      </ScrollView>

      {/* Iris-close into the chapter hub */}
      {opening && (
        <IrisTransition
          duration={600}
          onDone={() => {
            router.push("/story/chapter");
            setOpening(false);
          }}
        />
      )}
    </SafeAreaView>
  );
}
