import { useRef, useState } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/ThemeContext";
import { haptics } from "../../lib/haptics";
import { usePlayerAbilities, type AbilityState } from "../../lib/abilities";
import { Rise, SectionTitle } from "@/components/ui/arcade";
import { BuildsHeader } from "@/components/builds/BuildsHeader";
import { AbilityCard } from "@/components/builds/AbilityCard";
import { AbilityInfoModal } from "@/components/builds/AbilityInfoModal";
import { UpgradeModal } from "@/components/builds/UpgradeModal";
import { useCoachMark } from "@/components/onboarding/CoachBubble";
import { SpotlightCoach } from "@/components/onboarding/SpotlightCoach";

const H_PADDING = 20;
const GAP = 12;
const COLUMNS = 2;

export default function BuildsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { states, gold, unlock, upgrade, equip } = usePlayerAbilities();
  const [infoAbility, setInfoAbility] = useState<AbilityState | null>(null);
  const [upgradeAbility, setUpgradeAbility] = useState<AbilityState | null>(null);
  const coach = useCoachMark("coach_builds");
  const firstCardRef = useRef<View>(null);

  const cardWidth = (width - H_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  const handleEquip = (a: AbilityState) => {
    if (equip(a)) haptics.select();
  };
  const handleUnlock = (a: AbilityState) => {
    if (unlock(a)) haptics.coin();
    else haptics.miss();
  };
  const handleConfirmUpgrade = (a: AbilityState) => {
    if (upgrade(a)) haptics.coin();
    else haptics.miss();
    setUpgradeAbility(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: H_PADDING, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <BuildsHeader gold={gold} />

        <SectionTitle>{t("builds.sectionTitle")}</SectionTitle>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            columnGap: GAP,
            rowGap: GAP,
            marginTop: 6,
          }}
        >
          {states.map((a, i) => (
            <Rise key={a.id} delay={i * 50}>
              <View ref={i === 0 ? firstCardRef : undefined} collapsable={false}>
                <AbilityCard
                  ability={a}
                  gold={gold}
                  width={cardWidth}
                  onEquip={handleEquip}
                  onUnlock={handleUnlock}
                  onUpgrade={setUpgradeAbility}
                  onInfo={setInfoAbility}
                  onQuestNav={() => router.navigate("/achievements")}
                />
              </View>
            </Rise>
          ))}
        </View>
      </ScrollView>

      {coach.show && !infoAbility && !upgradeAbility && (
        <SpotlightCoach
          targetRef={firstCardRef}
          text={t("onboarding.coach.builds")}
          onDismiss={coach.dismiss}
        />
      )}

      <AbilityInfoModal ability={infoAbility} onClose={() => setInfoAbility(null)} />
      <UpgradeModal
        ability={upgradeAbility}
        gold={gold}
        onConfirm={handleConfirmUpgrade}
        onClose={() => setUpgradeAbility(null)}
      />
    </SafeAreaView>
  );
}
