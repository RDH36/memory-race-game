import { BackHandler, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalGame } from "../../hooks/useLocalGame";
import { GameGrid } from "../../components/game/GameGrid";
import { formatTime } from "../../components/game/PlayerHUD";
import { BattleHUD } from "../../components/game/arcade/BattleHUD";
import { useGameChatter } from "../../components/game/arcade/useGameChatter";
import { IconBtn } from "@/components/ui/arcade";
import { ActionBar } from "../../components/game/ActionBar";
import { TornadoOverlay } from "../../components/game/TornadoOverlay";
import { MatchFeedback } from "../../components/game/MatchFeedback";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { GRID_CONFIG, type CpuDifficulty } from "../../lib/gameLogic";
import { showInterstitialThen } from "../../hooks/useInterstitialAd";
import { usePremium } from "../../hooks/useEntitlements";
import { getCardSkin } from "../../lib/skins";

const CPU_PROFILES: Record<string, { name: string; avatar: string }> = {
  easy: { name: "BabyBot", avatar: "🐣" },
  medium: { name: "NekoFlash", avatar: "🦊" },
  hard: { name: "AlphaMemory", avatar: "🤖" },
};

export default function GameScreen() {
  const { difficulty = "medium", xpBoost = "0" } = useLocalSearchParams<{ difficulty?: string; xpBoost?: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { avatar, nickname, selectedTable } = usePlayerStats();
  const premium = usePremium();
  const skin = getCardSkin(selectedTable);
  const { game, lastMatchResult, handleCardPress, handleTornado, handleTornadoComplete } =
    useLocalGame(difficulty as CpuDifficulty);

  const cpu = CPU_PROFILES[difficulty] ?? CPU_PROFILES.medium;
  const [turnTimer, setTurnTimer] = useState(0);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameStartRef = useRef(Date.now());

  useEffect(() => {
    if (game.status !== "playing") return;
    setTurnTimer(0);
    timerRef.current = setInterval(() => setTurnTimer((prev) => prev + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [game.currentTurn, game.status]);

  useEffect(() => {
    if (game.status === "finished") {
      if (timerRef.current) clearInterval(timerRef.current);
      const totalTimeSec = Math.round((Date.now() - gameStartRef.current) / 1000);
      showInterstitialThen(() => {
        router.replace({
          pathname: "/result",
          params: {
            p1Score: game.scores.p1.toString(),
            p2Score: game.scores.p2.toString(),
            difficulty,
            totalTime: totalTimeSec.toString(),
            p1Attempts: game.p1Attempts.toString(),
            tornadoUsed: game.tornadoUsed.p1 ? "1" : "0",
            maxStreak: game.p1MaxStreak.toString(),
            xpBoost,
          },
        });
      }, { skip: premium });
    }
  }, [game.status, premium]);

  const confirmQuit = () => {
    if (game.status !== "playing") {
      router.back();
      return;
    }
    setShowQuitModal(true);
  };

  const handleAbandon = () => {
    setShowQuitModal(false);
    router.back();
  };

  // Android back button
  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (game.status === "playing") {
        confirmQuit();
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [game.status]);

  const canUseTornado =
    game.currentTurn === 1 &&
    !game.tornadoUsed.p1 &&
    !game.locked &&
    !game.tornadoActive &&
    game.status === "playing";

  const gridConfig = GRID_CONFIG[(difficulty as CpuDifficulty) ?? 'medium'];
  const totalPairs = gridConfig.totalCards / 2;
  const chatter = useGameChatter({
    lastMatchResult,
    currentTurn: game.currentTurn as 1 | 2,
    status: game.status,
    playerAvatar: avatar,
    opponentAvatar: cpu.avatar,
    playerName: nickname || t("game.you"),
    opponentName: cpu.name,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 }}>
        {/* Top bar — back */}
        <View style={{ marginBottom: 10 }}>
          <IconBtn color="white" onPress={confirmQuit}>
            ✕
          </IconBtn>
        </View>

        {/* Battle HUD — you vs IA + score + bubbles + turn timer */}
        <BattleHUD
          player={{
            avatar,
            name: t("game.you"),
            score: game.scores.p1,
            active: game.currentTurn === 1,
          }}
          opponent={{
            avatar: cpu.avatar,
            name: cpu.name,
            score: game.scores.p2,
            active: game.currentTurn === 2,
          }}
          matched={game.scores.p1 + game.scores.p2}
          totalPairs={totalPairs}
          chatter={chatter}
          timer={{ text: formatTime(turnTimer) }}
        />

        <View style={{ height: 12 }} />

        {/* Grid */}
        <View style={{ flex: 1 }}>
          <GameGrid
            positions={game.positions}
            cardEmojis={game.cardEmojis}
            selected={game.selected}
            matchedBy={game.matchedBy}
            locked={game.locked || game.currentTurn !== 1}
            currentTurn={game.currentTurn}
            lastMatchResult={lastMatchResult}
            tornadoActive={game.tornadoActive}
            onCardPress={handleCardPress}
            cols={gridConfig.cols}
            skin={skin}
          />
          <MatchFeedback result={lastMatchResult} />
        </View>

        {/* Tornado card */}
        <ActionBar canUseTornado={canUseTornado} tornadoUsed={game.tornadoUsed.p1} onTornado={handleTornado} />
      </View>

      {game.tornadoActive && (
        <TornadoOverlay onComplete={handleTornadoComplete} />
      )}

      <ConfirmModal
        visible={showQuitModal}
        icon="🏳️"
        title={t("room.quitTitle")}
        message={t("room.quitMessage")}
        cancelText={t("room.quitCancel")}
        confirmText={t("room.quitConfirm")}
        confirmIcon="🚪"
        onCancel={() => setShowQuitModal(false)}
        onConfirm={handleAbandon}
      />
    </SafeAreaView>
  );
}
