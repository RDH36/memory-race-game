import { BackHandler, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalGame } from "../../hooks/useLocalGame";
import { GameGrid } from "../../components/game/GameGrid";
import { OpponentCard, ProgressDots, formatTime } from "../../components/game/PlayerHUD";
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
  const { colors, isDark } = useTheme();
  const { avatar, selectedTable } = usePlayerStats();
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
  const cpuLevel = t(`home.difficulty.${difficulty}`);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 }}>
        {/* Header — back button */}
        <View style={{ marginBottom: 10 }}>
          <Pressable
            onPress={confirmQuit}
            hitSlop={16}
            style={{
              flexDirection: "row",
              alignItems: "center",
              alignSelf: "flex-start",
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 10,
              backgroundColor: colors.surfaceContainer,
            }}
          >
            <Text style={{ fontSize: 18, color: colors.onSurfaceVariant, marginRight: 4 }}>←</Text>
            <Text style={{ fontSize: 14, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant }}>
              {t("game.menu")}
            </Text>
          </Pressable>
        </View>

        {/* Opponent card — IA */}
        <OpponentCard
          name={cpu.name}
          subtitle={`🤖 ${t("game.ia")} · ${cpuLevel}`}
          avatar={cpu.avatar}
          pairsMatched={game.scores.p2}
          totalPairs={totalPairs}
          isActive={game.currentTurn === 2}
          timerSeconds={game.currentTurn === 2 ? turnTimer : 0}
        />

        {/* Score */}
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "center", marginVertical: 8 }}>
          <Text style={{ fontSize: 11, fontFamily: "Nunito_700Bold", color: colors.onSurfaceVariant, letterSpacing: 1, marginRight: 8 }}>
            {t("game.pairs")}
          </Text>
          <Text style={{ fontSize: 18, fontFamily: "Fredoka_700Bold", color: colors.p1 }}>
            {game.scores.p1}
          </Text>
          <Text style={{ fontSize: 14, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginHorizontal: 6 }}>—</Text>
          <Text style={{ fontSize: 18, fontFamily: "Fredoka_700Bold", color: colors.p2 }}>
            {game.scores.p2}
          </Text>
          <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginLeft: 4 }}>
            / {totalPairs}
          </Text>
        </View>

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

        {/* Player bar */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, gap: 10 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: colors.primaryContainerBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 18 }}>{avatar}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontFamily: "Fredoka_600SemiBold", color: colors.onSurface }}>{t("game.you")}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={{ fontSize: 11, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant }}>{t("game.player")}</Text>
              {!game.tornadoUsed.p1 && <Text style={{ fontSize: 11 }}>🌪️</Text>}
            </View>
          </View>
          <ProgressDots filled={game.scores.p1} total={totalPairs} />
          <View
            style={{
              backgroundColor: game.currentTurn === 1 ? colors.primaryContainerBg : isDark ? '#2A2A2A' : '#F5F2F2',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Fredoka_600SemiBold",
                color: game.currentTurn === 1 ? colors.primaryContainer : colors.onSurfaceVariant,
              }}
            >
              {formatTime(game.currentTurn === 1 ? turnTimer : 0)}
            </Text>
          </View>
        </View>
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
