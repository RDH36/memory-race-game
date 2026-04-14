import { BackHandler, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useOnlineGame } from "../../hooks/useOnlineGame";
import { useBotPlayer } from "../../hooks/useBotPlayer";
import { useRoom, forfeitRoom, deleteRoom } from "../../lib/roomLogic";
import { GameGrid } from "../../components/game/GameGrid";
import { OpponentCard, ProgressDots } from "../../components/game/PlayerHUD";
import { ActionBar } from "../../components/game/ActionBar";
import { TornadoOverlay } from "../../components/game/TornadoOverlay";
import { MatchFeedback } from "../../components/game/MatchFeedback";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { LoadingCard } from "../../components/ui/LoadingCard";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { GRID_CONFIG, type CpuDifficulty } from "../../lib/gameLogic";
import { showInterstitialThen } from "../../hooks/useInterstitialAd";

const TURN_TIMEOUT = 60;

function Tooltip({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeInDown.duration(250)} style={{ backgroundColor: colors.primaryContainer, borderRadius: 18, paddingHorizontal: 24, paddingVertical: 14, alignSelf: "stretch", marginHorizontal: 4 }}>
      <Text style={{ color: "#FFF", fontFamily: "Fredoka_700Bold", fontSize: 18, textAlign: "center" }}>{text}</Text>
    </Animated.View>
  );
}

export default function OnlineGameScreen() {
  const { roomCode, difficulty = "medium", botMode: botModeParam } = useLocalSearchParams<{
    roomCode: string;
    difficulty?: string;
    botMode?: string;
  }>();
  const isBotMode = botModeParam === "1";
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { avatar, userId, nickname } = usePlayerStats();
  const { room } = useRoom(roomCode);

  const {
    game, isHost, myTurn, lastMatchResult,
    handleCardPress, handleTornado, handleTornadoComplete,
  } = useOnlineGame(room, userId);

  // Ghost bot plays as guest when botMode is active
  useBotPlayer(room, game, difficulty as CpuDifficulty, isBotMode);

  const gameStartRef = useRef(Date.now());
  const [turnTimer, setTurnTimer] = useState(TURN_TIMEOUT);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const forfeitTriggeredRef = useRef(false);
  const [showQuitModal, setShowQuitModal] = useState(false);

  const opponentName = isHost ? room?.guestNickname ?? "Guest" : room?.hostNickname ?? "Host";
  const opponentAvatar = isHost ? room?.guestAvatar ?? "🧠" : room?.hostAvatar ?? "🧠";
  const myName = nickname || (isHost ? room?.hostNickname : room?.guestNickname) || t("game.you");

  // --- 60s turn timer: reset on every turn change ---
  useEffect(() => {
    if (!game || game.status !== "playing") return;
    setTurnTimer(TURN_TIMEOUT);
    forfeitTriggeredRef.current = false;

    timerRef.current = setInterval(() => {
      setTurnTimer((prev) => {
        const next = prev - 1;
        if (next <= 0 && !forfeitTriggeredRef.current) {
          forfeitTriggeredRef.current = true;
          // The current player loses — opponent wins
          if (room) {
            const winnerId = game.currentTurn === 1 ? room.guestId! : room.hostId;
            forfeitRoom(room.id, winnerId);
          }
        }
        return Math.max(0, next);
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [game?.currentTurn, game?.status]);

  // --- Quit confirmation ---
  const confirmQuit = () => {
    if (!room || !game || game.status !== "playing") {
      router.back();
      return;
    }
    setShowQuitModal(true);
  };

  const handleAbandon = () => {
    setShowQuitModal(false);
    if (!room || !game) { router.back(); return; }

    const winnerId = isHost ? room.guestId! : room.hostId;
    forfeitRoom(room.id, winnerId);

    const totalTimeSec = Math.round((Date.now() - gameStartRef.current) / 1000);
    const myScore = isHost ? game.scores.p1 : game.scores.p2;
    const theirScore = isHost ? game.scores.p2 : game.scores.p1;

    router.replace({
      pathname: "/result",
      params: {
        p1Score: myScore.toString(),
        p2Score: theirScore.toString(),
        difficulty,
        totalTime: totalTimeSec.toString(),
        p1Attempts: game.p1Attempts.toString(),
        tornadoUsed: (isHost ? game.tornadoUsed.p1 : game.tornadoUsed.p2) ? "1" : "0",
        maxStreak: game.p1MaxStreak.toString(),
        mode: "casual",
        roomId: room.id,
        opponentName, opponentAvatar,
        isHost: isHost ? "1" : "0",
        forfeit: "1",
        forfeitWon: "0",
        ...(isBotMode && { matchmaking: "1" }),
      },
    });
  };

  // Android back button
  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (game?.status === "playing") {
        confirmQuit();
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [game?.status, room?.id]);

  // --- Game finished or forfeit → navigate to result ---
  useEffect(() => {
    if (!room || !game) return;
    if (game.status === "finished" || room.status === "forfeit" || room.status === "finished") {
      if (timerRef.current) clearInterval(timerRef.current);
      const totalTimeSec = Math.round((Date.now() - gameStartRef.current) / 1000);
      const myScore = isHost ? game.scores.p1 : game.scores.p2;
      const theirScore = isHost ? game.scores.p2 : game.scores.p1;
      const iWonForfeit = room.status === "forfeit" && room.winnerId === userId;

      showInterstitialThen(() => {
        router.replace({
          pathname: "/result",
          params: {
            p1Score: myScore.toString(),
            p2Score: theirScore.toString(),
            difficulty,
            totalTime: totalTimeSec.toString(),
            p1Attempts: game.p1Attempts.toString(),
            tornadoUsed: (isHost ? game.tornadoUsed.p1 : game.tornadoUsed.p2) ? "1" : "0",
            maxStreak: game.p1MaxStreak.toString(),
            mode: "casual",
            roomId: room.id,
            opponentName, opponentAvatar,
            isHost: isHost ? "1" : "0",
            forfeit: room.status === "forfeit" ? "1" : "0",
            forfeitWon: iWonForfeit ? "1" : "0",
            ...(isBotMode && { matchmaking: "1" }),
          },
        });
      });
    }
  }, [game?.status, room?.status]);

  // --- Loading ---
  if (!game || !room) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
        <LoadingCard />
      </SafeAreaView>
    );
  }

  const gridConfig = GRID_CONFIG[(difficulty as CpuDifficulty) ?? "medium"];
  const totalPairs = gridConfig.totalCards / 2;
  const myScore = isHost ? game.scores.p1 : game.scores.p2;
  const opponentScore = isHost ? game.scores.p2 : game.scores.p1;
  const tornadoKey = isHost ? "p1" : "p2";
  const canUseTornado = myTurn && !game.tornadoUsed[tornadoKey] && !game.locked && !game.tornadoActive && game.status === "playing";

  const turnLabel = myTurn
    ? `${t("room.yourTurn")} · ⏱️ ${turnTimer}s`
    : `${t("room.turnOf")} ${opponentName} · ⏱️ ${turnTimer}s`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 }}>
        {/* Back button */}
        <View style={{ marginBottom: 10 }}>
          <Pressable onPress={confirmQuit} hitSlop={16}
            style={{ flexDirection: "row", alignItems: "center", alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: colors.surfaceContainer }}
          >
            <Text style={{ fontSize: 18, color: colors.onSurfaceVariant, marginRight: 4 }}>←</Text>
            <Text style={{ fontSize: 14, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant }}>{t("game.menu")}</Text>
          </Pressable>
        </View>

        {/* Opponent card */}
        <OpponentCard
          name={opponentName}
          subtitle={`👤 ${t("room.friend")}`}
          avatar={opponentAvatar}
          pairsMatched={opponentScore}
          totalPairs={totalPairs}
          isActive={!myTurn}
          timerSeconds={0}
          hideTimer
        />

        {/* Score */}
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "center", marginVertical: 8 }}>
          <Text style={{ fontSize: 11, fontFamily: "Nunito_700Bold", color: colors.onSurfaceVariant, letterSpacing: 1, marginRight: 8 }}>
            {t("game.pairs")}
          </Text>
          <Text style={{ fontSize: 18, fontFamily: "Fredoka_700Bold", color: colors.p1 }}>{myScore}</Text>
          <Text style={{ fontSize: 14, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginHorizontal: 6 }}>—</Text>
          <Text style={{ fontSize: 18, fontFamily: "Fredoka_700Bold", color: colors.p2 }}>{opponentScore}</Text>
          <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginLeft: 4 }}>/ {totalPairs}</Text>
        </View>

        {/* Turn tooltip with timer */}
        <View style={{ minHeight: 44, marginBottom: 4 }}>
          {game.status === "playing" && (
            <Tooltip key={`turn-${game.currentTurn}-${turnTimer <= 10 ? "red" : "ok"}`} text={turnLabel} />
          )}
        </View>

        {/* Grid */}
        <View style={{ flex: 1 }}>
          <GameGrid
            positions={game.positions}
            cardEmojis={game.cardEmojis}
            selected={game.selected}
            matchedBy={game.matchedBy}
            locked={game.locked || !myTurn}
            currentTurn={game.currentTurn}
            lastMatchResult={lastMatchResult}
            tornadoActive={game.tornadoActive}
            onCardPress={handleCardPress}
            cols={gridConfig.cols}
          />
          <MatchFeedback result={lastMatchResult} />
        </View>

        {/* Tornado */}
        <ActionBar canUseTornado={canUseTornado} tornadoUsed={game.tornadoUsed[tornadoKey]} onTornado={handleTornado} />

        {/* Player bar */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, gap: 10 }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primaryContainerBg, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 18 }}>{avatar}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontFamily: "Fredoka_600SemiBold", color: colors.onSurface }}>{t("game.you")}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={{ fontSize: 11, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant }}>{t("game.player")}</Text>
              {!game.tornadoUsed[tornadoKey] && <Text style={{ fontSize: 11 }}>🌪️</Text>}
            </View>
          </View>
          <ProgressDots filled={myScore} total={totalPairs} />
        </View>
      </View>

      {game.tornadoActive && <TornadoOverlay onComplete={handleTornadoComplete} />}

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
