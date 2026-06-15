import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import type { HueName } from "@/components/ui/theme";
import { ScreenHeader, SectionTitle } from "@/components/ui/arcade";
import { ChoiceRow } from "@/components/mode/arcade/ChoiceRow";
import { ModeHeroArcade } from "@/components/mode/arcade/ModeHeroArcade";
import { ModeStatsArcade } from "@/components/mode/arcade/ModeStatsArcade";
import { ModeXpBoost } from "../../components/mode/ModeXpBoost";
import { useTheme } from "../../lib/ThemeContext";
import { useConnectivity } from "../../lib/ConnectivityContext";
import { usePlayerStats } from "../../lib/playerStats";
import { useGameModeStats } from "../../lib/gameModeStats";
import { useRewardedAd } from "../../hooks/useRewardedAd";
import { useFlag } from "../../lib/analytics";

type OptionKey = "matchmaking" | "create" | "join";

const ROUTES: Record<OptionKey, string> = {
  matchmaking: "/room/matchmaking",
  create: "/room/create",
  join: "/room/join",
};

export default function CasualModeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isOnline, requireOnline } = useConnectivity();
  const { userId } = usePlayerStats();
  const modeStats = useGameModeStats(userId);
  const [xpBoost, setXpBoost] = useState(true);

  const onRewardEarned = useCallback(() => {}, []);
  const { isLoaded: rewardedLoaded, showAd: showRewardedAd } = useRewardedAd(onRewardEarned);
  const campaignOn = useFlag("campaign_enabled");

  const friendsStats = modeStats?.friends;
  const gamesPlayed = friendsStats?.gamesPlayed ?? 0;
  const winRate = friendsStats?.winRate ?? 0;
  const gamesWon = friendsStats?.gamesWon ?? 0;

  const options: { key: OptionKey; icon: string; title: string; desc: string; color: HueName }[] = [
    {
      key: "matchmaking",
      icon: "🎲",
      title: t("room.matchmaking"),
      desc: t("room.matchmakingDesc"),
      color: "gold",
    },
    {
      key: "create",
      icon: "🏠",
      title: t("room.createRoom"),
      desc: t("room.createDesc"),
      color: "green",
    },
    {
      key: "join",
      icon: "🔗",
      title: t("room.joinRoom"),
      desc: t("room.joinDesc"),
      color: "violet",
    },
  ];

  const handleOptionPress = (key: OptionKey) => {
    requireOnline(() => {
      const shouldBoost = xpBoost && rewardedLoaded;

      const navigate = () => {
        router.push({ pathname: ROUTES[key], params: shouldBoost ? { xpBoost: "1" } : {} });
      };

      if (shouldBoost) {
        showRewardedAd();
        setTimeout(navigate, 500);
      } else {
        navigate();
      }
    });
  };

  const stats = [
    { value: String(gamesPlayed), label: t("stats.games") },
    { value: gamesPlayed > 0 ? `${winRate}%` : "—", label: t("stats.winRate") },
    { value: String(gamesWon), label: "🏆" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title={t("home.modes.casual")} onBack={() => router.back()} />

        <ModeHeroArcade
          icon="⚔️"
          title={t("home.modes.casual")}
          subtitle={t("home.modes.casualDesc")}
          color="coral"
        />

        <ModeStatsArcade stats={stats} />

        {/* Story campaign — chapters against the Demon King (kill-switchable) */}
        {campaignOn && (
          <>
            <SectionTitle style={{ marginBottom: 10 }}>{t("mode.sectionStory")}</SectionTitle>
            <View style={{ marginBottom: 20 }}>
              <ChoiceRow
                icon="📖"
                title={t("mode.campaignTitle")}
                desc={t("mode.campaignDesc")}
                color="violet"
                delay={100}
                onPress={() => router.push("/story")}
              />
            </View>
          </>
        )}

        {/* Online play */}
        <SectionTitle style={{ marginBottom: 10 }}>{t("mode.sectionOnline")}</SectionTitle>
        <View style={{ gap: 13, marginBottom: 20 }}>
          {options.map((opt, index) => (
            <ChoiceRow
              key={opt.key}
              icon={opt.icon}
              title={opt.title}
              desc={opt.desc}
              color={opt.color}
              delay={170 + index * 70}
              disabled={!isOnline}
              onPress={() => handleOptionPress(opt.key)}
            />
          ))}
        </View>

        {/* Solo training */}
        <SectionTitle style={{ marginBottom: 10 }}>{t("mode.sectionSolo")}</SectionTitle>
        <View style={{ marginBottom: 20 }}>
          <ChoiceRow
            icon="🧠"
            title={t("home.modes.solo")}
            desc={t("home.modes.soloDesc")}
            color="blue"
            delay={400}
            onPress={() => router.push("/mode/solo")}
          />
        </View>

        <ModeXpBoost value={xpBoost} onChange={setXpBoost} />
      </ScrollView>
    </SafeAreaView>
  );
}
