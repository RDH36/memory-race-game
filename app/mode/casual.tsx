import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { Label } from "../../components/ui/Label";
import { ModeBackButton } from "../../components/mode/ModeBackButton";
import { ModeHero } from "../../components/mode/ModeHero";
import { ModeStatsStrip } from "../../components/mode/ModeStatsStrip";
import { ModeOptionCard } from "../../components/mode/ModeOptionCard";
import { ModeXpBoost } from "../../components/mode/ModeXpBoost";
import { useTheme } from "../../lib/ThemeContext";
import { useConnectivity } from "../../lib/ConnectivityContext";
import { usePlayerStats } from "../../lib/playerStats";
import { useGameModeStats } from "../../lib/gameModeStats";
import { useRewardedAd } from "../../hooks/useRewardedAd";

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

  const friendsStats = modeStats?.friends;
  const gamesPlayed = friendsStats?.gamesPlayed ?? 0;
  const winRate = friendsStats?.winRate ?? 0;
  const gamesWon = friendsStats?.gamesWon ?? 0;

  const options: { key: OptionKey; icon: string; title: string; desc: string; color: string }[] = [
    {
      key: "matchmaking",
      icon: "🎲",
      title: t("room.matchmaking"),
      desc: t("room.matchmakingDesc"),
      color: colors.warning,
    },
    {
      key: "create",
      icon: "🏠",
      title: t("room.createRoom"),
      desc: t("room.createDesc"),
      color: colors.success,
    },
    {
      key: "join",
      icon: "🔗",
      title: t("room.joinRoom"),
      desc: t("room.joinDesc"),
      color: colors.primaryContainer,
    },
  ];

  const handleOptionPress = (key: OptionKey) => {
    requireOnline(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        <ModeBackButton />

        <ModeHero
          gradientColors={[colors.success, "#17835F"]}
          icon="🔥"
          title={t("home.modes.casual")}
          subtitle={t("home.modes.casualDesc")}
        />

        <ModeStatsStrip stats={stats} />

        <Label text={t("home.chooseYourGame")} />
        <View style={{ gap: 10, marginBottom: 20 }}>
          {options.map((opt, index) => (
            <ModeOptionCard
              key={opt.key}
              icon={opt.icon}
              title={opt.title}
              desc={opt.desc}
              color={opt.color}
              index={index}
              disabled={!isOnline}
              onPress={() => handleOptionPress(opt.key)}
            />
          ))}
        </View>

        <ModeXpBoost value={xpBoost} onChange={setXpBoost} />
      </ScrollView>
    </SafeAreaView>
  );
}
