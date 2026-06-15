import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import { usePlayerStats } from "@/lib/playerStats";
import { useQuests } from "@/lib/quests";
import { track } from "@/lib/analytics";
import { haptics } from "@/lib/haptics";
import { MitsitsyCard } from "@/components/promo/MitsitsyCard";
import { Panel, Pop, Rise, Ribbon, XPBar } from "@/components/ui/arcade";
import { HomeHeader } from "@/components/home/arcade/HomeHeader";
import { ArcadeHero } from "@/components/home/arcade/ArcadeHero";
import { QuickModes } from "@/components/home/arcade/QuickModes";
import { HomeStats } from "@/components/home/arcade/HomeStats";
import { StoryButton } from "@/components/home/arcade/StoryButton";
import { FeaturedQuest } from "@/components/achievements/FeaturedQuest";
import { useCoachMark } from "@/components/onboarding/CoachBubble";
import { SpotlightCoach } from "@/components/onboarding/SpotlightCoach";

// Tab slots left to right, matching the tab bar order.
const MENU_TOUR = ["menuBuilds", "menuQuests", "menuPlay", "menuShop", "menuProfile"];

const DAILY_REWARD_KEY = "daily_reward_last_claimed";
const DAILY_REWARD_XP = 15;
const DAILY_REWARD_GOLD = 30;
const DAILY_REWARD_LIVES = 3;

function isSameDay(ts1: number, ts2: number) {
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { level, levelProgress, xpInLevel, xpForNextLevel, addBonusXp, addGold, addLives } = usePlayerStats();
  const { featured, claim } = useQuests();
  const [dailyClaimed, setDailyClaimed] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(DAILY_REWARD_KEY).then((val) => {
      if (!val || !isSameDay(parseInt(val, 10), Date.now())) {
        setDailyClaimed(false);
      }
    });
  }, []);

  // First-visit guided tour: spotlight the PLAY hero, then walk the tab
  // menu one slot at a time (-1 = hero, 0-4 = tabs).
  const coach = useCoachMark("coach_home");
  const heroRef = useRef<View>(null);
  const [tourStep, setTourStep] = useState(-1);

  const claimDailyReward = useCallback(() => {
    if (dailyClaimed) return;
    addBonusXp(DAILY_REWARD_XP);
    addGold(DAILY_REWARD_GOLD);
    addLives(DAILY_REWARD_LIVES);
    track("daily_reward_claimed");
    setDailyClaimed(true);
    AsyncStorage.setItem(DAILY_REWARD_KEY, Date.now().toString());
    haptics.coin();
  }, [dailyClaimed, addBonusXp, addGold, addLives]);

  const [gold, goldD, goldBg] = colors.hues.gold;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader />

        {/* XP strip */}
        <Rise delay={60}>
          <Panel style={{ padding: 12, marginBottom: 16 }}>
            <XPBar
              level={level}
              pct={Math.round(levelProgress * 100)}
              xpIn={xpInLevel}
              xpFor={xpForNextLevel}
            />
          </Panel>
        </Rise>

        <View ref={heroRef} collapsable={false}>
          <ArcadeHero />
        </View>

        {/* Daily reward */}
        {!dailyClaimed && (
          <Pop style={{ marginBottom: 16 }}>
            <Panel
              onPress={claimDailyReward}
              haptic="none"
              background={goldBg}
              style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12 }}
            >
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  backgroundColor: colors.surfaceContainer,
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 3px 0 ${goldD}`,
                }}
              >
                <Text style={{ fontSize: 24 }}>🎁</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 15, color: goldD }}>
                  {t("home.dailyReward")}
                </Text>
                <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 11.5, color: gold }}>
                  {t("home.dailyRewardSubtitle", { xp: DAILY_REWARD_XP, gold: DAILY_REWARD_GOLD, lives: DAILY_REWARD_LIVES })}
                </Text>
              </View>
              <Ribbon color="gold">{t("home.dailyRewardClaim")}</Ribbon>
            </Panel>
          </Pop>
        )}

        {featured && !featured.claimed && (
          <Rise delay={100}>
            <View style={{ marginBottom: 10 }}>
              <FeaturedQuest
                state={featured}
                onClaim={() => {
                  if (claim(featured.id)) haptics.coin();
                }}
                onPress={() => router.navigate("/achievements")}
              />
            </View>
          </Rise>
        )}

        {/* Story banner — twin of the featured quest card */}
        <Rise delay={120}>
          <View style={{ marginBottom: 16 }}>
            <StoryButton />
          </View>
        </Rise>

        <Rise delay={120}>
          <QuickModes />
        </Rise>

        <Rise delay={160}>
          <HomeStats />
        </Rise>

        {/* Cross-promo */}
        <View style={{ marginTop: 24 }}>
          <MitsitsyCard />
        </View>
      </ScrollView>

      {coach.show && tourStep === -1 && (
        <SpotlightCoach
          targetRef={heroRef}
          text={t("onboarding.coach.home")}
          onDismiss={() => setTourStep(0)}
          onPressTarget={() => {
            coach.dismiss();
            router.push("/mode/casual");
          }}
        />
      )}
      {coach.show && tourStep >= 0 && tourStep < MENU_TOUR.length && (
        <SpotlightCoach
          menu
          menuIndex={tourStep}
          text={t(`onboarding.coach.${MENU_TOUR[tourStep]}`)}
          onDismiss={() => (tourStep === MENU_TOUR.length - 1 ? coach.dismiss() : setTourStep(tourStep + 1))}
        />
      )}
    </SafeAreaView>
  );
}
