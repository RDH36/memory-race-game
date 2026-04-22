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
import { usePlayerStats } from "../../lib/playerStats";
import { useGameModeStats } from "../../lib/gameModeStats";
import { useRewardedAd } from "../../hooks/useRewardedAd";

type Difficulty = "easy" | "medium" | "hard";

export default function SoloModeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { userId } = usePlayerStats();
  const modeStats = useGameModeStats(userId);
  const [loading, setLoading] = useState<string | null>(null);
  const [xpBoost, setXpBoost] = useState(true);

  const onRewardEarned = useCallback(() => {}, []);
  const { isLoaded: rewardedLoaded, showAd: showRewardedAd } = useRewardedAd(onRewardEarned);

  const totalAi = modeStats
    ? modeStats.aiEasy.gamesPlayed + modeStats.aiMedium.gamesPlayed + modeStats.aiHard.gamesPlayed
    : 0;
  const totalAiWon = modeStats
    ? modeStats.aiEasy.gamesWon + modeStats.aiMedium.gamesWon + modeStats.aiHard.gamesWon
    : 0;
  const aiWinRate = totalAi > 0 ? Math.round((totalAiWon / totalAi) * 100) : 0;

  const options: { key: Difficulty; icon: string; title: string; desc: string; color: string }[] = [
    {
      key: "easy",
      icon: "🐣",
      title: t("home.difficulty.easy"),
      desc: t("home.difficulty.easyDesc"),
      color: colors.success,
    },
    {
      key: "medium",
      icon: "🦊",
      title: t("home.difficulty.medium"),
      desc: t("home.difficulty.mediumDesc"),
      color: colors.primaryContainer,
    },
    {
      key: "hard",
      icon: "🤖",
      title: t("home.difficulty.hard"),
      desc: t("home.difficulty.hardDesc"),
      color: colors.p2,
    },
  ];

  const handleSelectDifficulty = (difficulty: Difficulty) => {
    if (loading) return;
    setLoading(difficulty);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const shouldBoost = xpBoost && rewardedLoaded;

    const navigate = () => {
      setTimeout(() => {
        router.push({
          pathname: "/game",
          params: { difficulty, mode: "solo", ...(shouldBoost && { xpBoost: "1" }) },
        });
        setLoading(null);
      }, 200);
    };

    if (shouldBoost) {
      showRewardedAd();
      setTimeout(navigate, 500);
    } else {
      navigate();
    }
  };

  const stats = [
    { value: String(totalAi), label: t("stats.games") },
    { value: totalAi > 0 ? `${aiWinRate}%` : "—", label: t("stats.winRate") },
    { value: String(totalAiWon), label: "🏆" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <ModeBackButton />

        <ModeHero
          gradientColors={[colors.primaryContainer, colors.primary]}
          icon="🎮"
          title={t("home.modes.solo")}
          subtitle={t("home.modes.soloDesc")}
        />

        <ModeStatsStrip stats={stats} />

        <Label text={t("home.difficultyLabel")} />
        <View style={{ gap: 10, marginBottom: 20 }}>
          {options.map((opt, index) => (
            <ModeOptionCard
              key={opt.key}
              icon={opt.icon}
              title={opt.title}
              desc={opt.desc}
              color={opt.color}
              index={index}
              disabled={!!loading && loading !== opt.key}
              onPress={() => handleSelectDifficulty(opt.key)}
            />
          ))}
        </View>

        <ModeXpBoost value={xpBoost} onChange={setXpBoost} />
      </ScrollView>
    </SafeAreaView>
  );
}
