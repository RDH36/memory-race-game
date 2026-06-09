import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { haptics } from "@/lib/haptics";
import { usePlayerStats } from "../../lib/playerStats";
import { useRewardedAd } from "../../hooks/useRewardedAd";
import { usePremium } from "../../hooks/useEntitlements";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { Linking } from "react-native";
import { ConfettiParticles } from "../../components/result/ConfettiParticles";
import { ScoreCard } from "../../components/result/ScoreCard";
import { StatItem } from "../../components/result/StatItem";
import { XpRewardBar } from "../../components/result/XpRewardBar";
import { Btn3D, Mascot } from "@/components/ui/arcade";
import { useTheme } from "../../lib/ThemeContext";
import { deleteRoom } from "../../lib/roomLogic";
import { maybeRequestReview } from "../../lib/storeReview";
import { MitsitsyCard } from "../../components/promo/MitsitsyCard";
import { CelebrationModal } from "../../components/celebration/CelebrationModal";
import {
  computeUnlockedAchievementIds,
  getAchievementEmoji,
  type AchievementId,
} from "../../lib/achievements";

type CelebrationItem =
  | { type: "levelUp"; level: number }
  | { type: "achievement"; achievementId: AchievementId };

const CPU_PROFILES: Record<string, { name: string; avatar: string }> = {
  easy: { name: "BabyBot", avatar: "🐣" },
  medium: { name: "NekoFlash", avatar: "🦊" },
  hard: { name: "AlphaMemory", avatar: "🤖" },
};

type Winner = "p1" | "p2" | "draw";

export default function ResultScreen() {
  const {
    p1Score = "0",
    p2Score = "0",
    difficulty = "medium",
    totalTime = "0",
    p1Attempts = "0",
    tornadoUsed = "0",
    maxStreak = "0",
    mode = "solo",
    roomId,
    opponentName,
    opponentAvatar,
    isHost = "1",
    forfeit = "0",
    forfeitWon = "0",
    matchmaking = "0",
    xpBoost = "0",
    powerEmoji = "🌪️",
    powerNameKey = "tornado",
  } = useLocalSearchParams<{
    p1Score?: string;
    p2Score?: string;
    difficulty?: string;
    totalTime?: string;
    p1Attempts?: string;
    tornadoUsed?: string;
    maxStreak?: string;
    mode?: string;
    roomId?: string;
    opponentName?: string;
    opponentAvatar?: string;
    isHost?: string;
    forfeit?: string;
    forfeitWon?: string;
    matchmaking?: string;
    xpBoost?: string;
    powerEmoji?: string;
    powerNameKey?: string;
  }>();
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState<"new" | "home" | null>(null);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const { avatar, stats, recordGame, addBonusXp, lastXpGain, level, levelProgress, xpInLevel, xpForNextLevel } = usePlayerStats();
  const recorded = useRef(false);
  const initialLevelRef = useRef<number | null>(null);
  const initialUnlockedRef = useRef<AchievementId[] | null>(null);
  const [celebrationQueue, setCelebrationQueue] = useState<CelebrationItem[]>([]);

  const onBonusReward = useCallback(() => {
    addBonusXp(10);
    setBonusClaimed(true);
    haptics.coin();
  }, [addBonusXp]);
  const { isLoaded: rewardedLoaded, showAd: showRewardedAd } = useRewardedAd(onBonusReward);
  const premium = usePremium();

  const { colors } = useTheme();

  const isCasual = mode === "casual";
  const isMatchmaking = matchmaking === "1";
  const iAmHost = isHost === "1";
  const isForfeit = forfeit === "1";
  const iWonForfeit = forfeitWon === "1";
  const roomCleaned = useRef(false);

  const cleanupRoom = () => {
    if (isCasual && roomId && !roomCleaned.current) {
      roomCleaned.current = true;
      deleteRoom(roomId);
    }
  };

  const s1 = parseInt(p1Score, 10);
  const s2 = parseInt(p2Score, 10);
  const winner: Winner = s1 > s2 ? "p1" : s2 > s1 ? "p2" : "draw";
  const cpu = CPU_PROFILES[difficulty] ?? CPU_PROFILES.medium;

  const displayOpponentName = isCasual ? (opponentName ?? "Friend") : cpu.name;
  const displayOpponentAvatar = isCasual ? (opponentAvatar ?? "👤") : cpu.avatar;

  // For forfeit, override winner based on forfeitWon flag
  const effectiveWinner: Winner = isForfeit
    ? (iWonForfeit ? "p1" : "p2")
    : winner;

  const resultTitle = isForfeit
    ? ""
    : effectiveWinner === "draw" ? t("result.drawTitle") : effectiveWinner === "p1" ? t("result.youWonTitle") : t("result.youLostTitle");
  const resultHighlight = isForfeit
    ? (iWonForfeit ? t("result.forfeitWin") : t("result.forfeitLoss"))
    : effectiveWinner === "draw" ? t("result.drawHighlight") : effectiveWinner === "p1" ? t("result.youWonHighlight") : t("result.youLostHighlight");
  const resultColor = effectiveWinner === "p1" ? colors.success : effectiveWinner === "p2" ? colors.error : colors.primaryContainer;
  const mascotEmoji = effectiveWinner === "p1" ? "🦊" : effectiveWinner === "p2" ? "😿" : "🤝";

  // Record game result once
  useEffect(() => {
    if (!recorded.current) {
      recorded.current = true;
      initialLevelRef.current = level;
      initialUnlockedRef.current = computeUnlockedAchievementIds(stats, level);
      recordGame(effectiveWinner === "p1", difficulty as string, {
        scoreP1: s1,
        scoreP2: s2,
        duration: timeSec,
        player2Type: isCasual ? "human" : "cpu",
      }, { xpBoost: xpBoost === "1" ? 1.5 : 1 });
    }
  }, []);

  // Detect level-up and newly unlocked achievements after stats refresh
  useEffect(() => {
    if (initialLevelRef.current === null || initialUnlockedRef.current === null) return;

    const currentUnlocked = computeUnlockedAchievementIds(stats, level);
    const newCelebrations: CelebrationItem[] = [];

    if (level > initialLevelRef.current) {
      newCelebrations.push({ type: "levelUp", level });
    }

    const previouslyUnlocked = new Set(initialUnlockedRef.current);
    for (const id of currentUnlocked) {
      if (!previouslyUnlocked.has(id)) {
        newCelebrations.push({ type: "achievement", achievementId: id });
      }
    }

    if (newCelebrations.length > 0) {
      setCelebrationQueue((prev) => [...prev, ...newCelebrations]);
      initialLevelRef.current = level;
      initialUnlockedRef.current = currentUnlocked;
    }
  }, [stats.points, level]);

  // Dynamic stats
  const attempts = parseInt(p1Attempts, 10);
  const precision = attempts > 0 ? Math.round((s1 / attempts) * 100) : 0;
  const timeSec = parseInt(totalTime, 10);
  const timePerPair = s1 > 0 ? (timeSec / s1).toFixed(1) : "—";
  const tornado = parseInt(tornadoUsed, 10);
  const streak = parseInt(maxStreak, 10);

  // Animations
  const opacityHeader = useSharedValue(0);
  const scaleTitle = useSharedValue(0.8);
  const opacityTitle = useSharedValue(0);
  const opacityCards = useSharedValue(0);
  const opacityXp = useSharedValue(0);
  const opacityStats = useSharedValue(0);
  const opacityButtons = useSharedValue(0);

  useEffect(() => {
    if (effectiveWinner === "p1") {
      haptics.win();
    } else if (effectiveWinner === "p2") {
      haptics.lose();
    } else {
      haptics.draw();
    }
    opacityHeader.value = withTiming(1, { duration: 300 });
    opacityTitle.value = withDelay(200, withTiming(1, { duration: 400 }));
    scaleTitle.value = withDelay(200, withSpring(1, { damping: 10, stiffness: 120 }));
    opacityCards.value = withDelay(500, withTiming(1, { duration: 400 }));
    opacityXp.value = withDelay(800, withTiming(1, { duration: 400 }));
    opacityStats.value = withDelay(1000, withTiming(1, { duration: 400 }));
    opacityButtons.value = withDelay(1200, withTiming(1, { duration: 400 }));
  }, []);

  // In-app review prompt after a win (waits for animations + stats update)
  const reviewTriggered = useRef(false);
  const statsRef = useRef(stats);
  statsRef.current = stats;
  useEffect(() => {
    if (effectiveWinner !== "p1" || reviewTriggered.current) return;
    reviewTriggered.current = true;
    const tid = setTimeout(() => {
      maybeRequestReview({ won: true, gamesWon: statsRef.current.gamesWon });
    }, 1700);
    return () => clearTimeout(tid);
  }, [effectiveWinner]);

  const headerStyle = useAnimatedStyle(() => ({ opacity: opacityHeader.value }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: opacityTitle.value, transform: [{ scale: scaleTitle.value }] }));
  const cardsStyle = useAnimatedStyle(() => ({ opacity: opacityCards.value }));
  const xpStyle = useAnimatedStyle(() => ({ opacity: opacityXp.value }));
  const statsStyle = useAnimatedStyle(() => ({ opacity: opacityStats.value }));
  const buttonsStyle = useAnimatedStyle(() => ({ opacity: opacityButtons.value }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      {effectiveWinner === "p1" && <ConfettiParticles />}

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Mascot + outcome title */}
        <Animated.View style={[headerStyle, { alignItems: "center", marginTop: 8 }]}>
          <Mascot emoji={mascotEmoji} size={80} />
        </Animated.View>
        <Animated.View style={[titleStyle, { alignItems: "center", marginBottom: 24 }]}>
          <Text style={{ fontSize: 38, fontFamily: "Fredoka_700Bold", color: resultColor, textAlign: "center" }}>
            {resultHighlight || resultTitle}
          </Text>
          <Text
            style={{ fontSize: 13, fontFamily: "Fredoka_700Bold", color: colors.onSurfaceMuted, marginTop: 4 }}
          >
            {isCasual ? t("result.headerCasual") : t("result.header")}
          </Text>
        </Animated.View>

        {/* Score card */}
        <Animated.View style={[cardsStyle, { marginBottom: 12 }]}>
          <ScoreCard
            p1Avatar={avatar}
            p1Name={t("game.you")}
            p1Score={s1}
            p2Avatar={displayOpponentAvatar}
            p2Name={displayOpponentName}
            p2Score={s2}
            winner={effectiveWinner}
          />
        </Animated.View>

        {/* XP Reward */}
        <Animated.View style={[xpStyle, { marginBottom: 12 }]}>
          <XpRewardBar
            xpGained={lastXpGain}
            level={level}
            levelProgress={levelProgress}
            xpInLevel={xpInLevel}
            xpForNextLevel={xpForNextLevel}
            won={effectiveWinner === "p1"}
            premiumBoosted={premium}
          />
        </Animated.View>

        {/* Rewarded bonus after defeat (hidden for premium — they already get +10% XP) */}
        {effectiveWinner === "p2" && !bonusClaimed && !premium && (
          <Animated.View style={[statsStyle, { marginBottom: 12 }]}>
            <Pressable
              onPress={() => {
                if (rewardedLoaded) showRewardedAd();
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: colors.hues.gold[2],
                borderRadius: 16,
                paddingVertical: 14,
                paddingHorizontal: 16,
                opacity: rewardedLoaded ? 1 : 0.5,
                boxShadow: `0 3px 0 ${colors.panelLip}`,
              }}
            >
              <Text style={{ fontSize: 18 }}>🎬</Text>
              <Text style={{ fontSize: 14, fontFamily: "Fredoka_700Bold", color: colors.warning }}>
                {t("result.watchAdBonus")}
              </Text>
            </Pressable>
          </Animated.View>
        )}
        {bonusClaimed && (
          <Animated.View style={[statsStyle, { marginBottom: 12 }]}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 8,
              }}
            >
              <Text style={{ fontSize: 14, fontFamily: "Nunito_700Bold", color: colors.success }}>
                ✓ {t("result.bonusClaimed")}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Stats grid */}
        <Animated.View style={statsStyle}>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            <StatItem value={`${timePerPair}s`} label={t("result.timePerPair")} />
            <StatItem value={`${precision}%`} label={t("result.precision")} />
          </View>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
            <StatItem value={`${powerEmoji} x${tornado}`} label={t(`abilities.${powerNameKey}.name`)} />
            <StatItem value={`${streak} 🔥`} label={t("result.streak")} />
          </View>
        </Animated.View>

        {/* Action buttons */}
        <Animated.View style={[buttonsStyle, { flexDirection: "row", gap: 11, width: "100%" }]}>
          <View style={{ flex: 1 }}>
            <Btn3D
              color="violet"
              size="lg"
              full
              haptic="press"
              label={t("result.newGame")}
              loading={loading === "new"}
              disabled={loading !== null && loading !== "new"}
              onPress={() => {
                setLoading("new");
                cleanupRoom();
                if (isMatchmaking) {
                  router.replace("/room/matchmaking");
                } else if (isCasual) {
                  router.replace("/mode/casual");
                } else {
                  router.replace("/mode/solo");
                }
              }}
            >
              <Text style={{ fontSize: 16 }}>🔀</Text>
            </Btn3D>
          </View>
          <View style={{ flex: 1 }}>
            <Btn3D
              color="white"
              size="lg"
              full
              label={t("result.goHome")}
              loading={loading === "home"}
              disabled={loading !== null && loading !== "home"}
              onPress={() => {
                setLoading("home");
                cleanupRoom();
                router.replace("/(tabs)");
              }}
            >
              <Text style={{ fontSize: 16 }}>🏠</Text>
            </Btn3D>
          </View>
        </Animated.View>

        {/* Cross-promo Mitsitsy */}
        <Animated.View style={[buttonsStyle, { marginTop: 28 }]}>
          <MitsitsyCard />
        </Animated.View>
      </ScrollView>

      {celebrationQueue.length > 0 && (
        <CelebrationModal
          visible
          type={celebrationQueue[0].type}
          level={celebrationQueue[0].type === "levelUp" ? celebrationQueue[0].level : undefined}
          achievementId={
            celebrationQueue[0].type === "achievement" ? celebrationQueue[0].achievementId : undefined
          }
          emoji={
            celebrationQueue[0].type === "achievement"
              ? getAchievementEmoji(celebrationQueue[0].achievementId)
              : undefined
          }
          onContinue={() => setCelebrationQueue((q) => q.slice(1))}
        />
      )}
    </SafeAreaView>
  );
}
