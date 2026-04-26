import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
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
import { Button } from "../../components/ui/Button";
import { Label } from "../../components/ui/Label";
import { useTheme } from "../../lib/ThemeContext";
import { deleteRoom } from "../../lib/roomLogic";
import { MitsitsyCard } from "../../components/promo/MitsitsyCard";

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
  }>();
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState<"replay" | "new" | "home" | null>(null);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const { avatar, recordGame, addBonusXp, lastXpGain, level, levelProgress, xpInLevel, xpForNextLevel } = usePlayerStats();
  const recorded = useRef(false);

  const onBonusReward = useCallback(() => {
    addBonusXp(10);
    setBonusClaimed(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [addBonusXp]);
  const { isLoaded: rewardedLoaded, showAd: showRewardedAd } = useRewardedAd(onBonusReward);
  const premium = usePremium();

  const { colors, isDark } = useTheme();

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

  // Record game result once
  useEffect(() => {
    if (!recorded.current) {
      recorded.current = true;
      recordGame(effectiveWinner === "p1", difficulty as string, {
        scoreP1: s1,
        scoreP2: s2,
        duration: timeSec,
        player2Type: isCasual ? "human" : "cpu",
      }, { xpBoost: xpBoost === "1" ? 1.5 : 1 });
    }
  }, []);

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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (effectiveWinner === "p2") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    opacityHeader.value = withTiming(1, { duration: 300 });
    opacityTitle.value = withDelay(200, withTiming(1, { duration: 400 }));
    scaleTitle.value = withDelay(200, withSpring(1, { damping: 10, stiffness: 120 }));
    opacityCards.value = withDelay(500, withTiming(1, { duration: 400 }));
    opacityXp.value = withDelay(800, withTiming(1, { duration: 400 }));
    opacityStats.value = withDelay(1000, withTiming(1, { duration: 400 }));
    opacityButtons.value = withDelay(1200, withTiming(1, { duration: 400 }));
  }, []);

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
        {/* Header label */}
        <Animated.View style={headerStyle}>
          <Label text={isCasual ? t("result.headerCasual") : t("result.header")} style={{ marginBottom: 8 }} />
        </Animated.View>

        {/* Title */}
        <Animated.View style={[titleStyle, { marginBottom: 24 }]}>
          <Text style={{ fontSize: 32, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
            {resultTitle} <Text style={{ color: resultColor }}>{resultHighlight}</Text>
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
                backgroundColor: "#D4820A" + "18",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#D4820A" + "40",
                paddingVertical: 12,
                paddingHorizontal: 16,
                opacity: rewardedLoaded ? 1 : 0.5,
              }}
            >
              <Text style={{ fontSize: 18 }}>🎬</Text>
              <Text style={{ fontSize: 14, fontFamily: "Fredoka_700Bold", color: "#D4820A" }}>
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
            <StatItem value={`🌪️ x${tornado}`} label={t("result.tornadoUsed")} />
            <StatItem value={`${streak} 🔥`} label={t("result.streak")} />
          </View>
        </Animated.View>

        {/* Action buttons */}
        <Animated.View style={[buttonsStyle, { flexDirection: "row", gap: 8, width: "100%" }]}>
          {!isMatchmaking && (
            <Button
              icon="🎮"
              text={t("result.rematch")}
              loading={loading === "replay"}
              disabled={loading !== null && loading !== "replay"}
              style={{ flex: 1 }}
              onPress={() => {
                setLoading("replay");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                cleanupRoom();
                if (isCasual) {
                  router.replace("/(tabs)");
                } else {
                  router.replace({ pathname: "/game", params: { difficulty } });
                }
              }}
            />
          )}
          <Button
            icon="🔀"
            text={t("result.newGame")}
            variant={isMatchmaking ? "primary" : "secondary"}
            loading={loading === "new"}
            disabled={loading !== null && loading !== "new"}
            style={{ flex: 1 }}
            onPress={() => {
              setLoading("new");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              cleanupRoom();
              if (isMatchmaking) {
                router.replace("/room/matchmaking");
              } else {
                router.replace("/(tabs)");
              }
            }}
          />
          <Button
            icon="🏠"
            text={t("result.goHome")}
            variant="ghost"
            loading={loading === "home"}
            disabled={loading !== null && loading !== "home"}
            style={{ flex: 1 }}
            onPress={() => {
              setLoading("home");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              cleanupRoom();
              router.replace("/(tabs)");
            }}
          />
        </Animated.View>

        {/* Cross-promo Mitsitsy */}
        <Animated.View style={[buttonsStyle, { marginTop: 28 }]}>
          <MitsitsyCard />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
