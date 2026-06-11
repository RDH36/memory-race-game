import { BackHandler, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useOnlineGame } from "../../hooks/useOnlineGame";
import { usePlayerAbilities, abilityEffect, magnitudeSuffix } from "../../lib/abilities";
import { PowerCastBanner } from "../../components/game/PowerCastBanner";
import type { HueName } from "@/components/ui/theme";
import { useBotPlayer } from "../../hooks/useBotPlayer";
import { useRoom, forfeitRoom } from "../../lib/roomLogic";
import { GameGrid } from "../../components/game/GameGrid";
import { BattleHUD } from "../../components/game/arcade/BattleHUD";
import { useGameChatter } from "../../components/game/arcade/useGameChatter";
import { IconBtn } from "@/components/ui/arcade";
import { ActionBar } from "../../components/game/ActionBar";
import { TornadoOverlay } from "../../components/game/TornadoOverlay";
import { MatchFeedback } from "../../components/game/MatchFeedback";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { LoadingCard } from "../../components/ui/LoadingCard";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { GRID_CONFIG, type CpuDifficulty } from "../../lib/gameLogic";
import { showInterstitialThen } from "../../hooks/useInterstitialAd";
import { usePremium } from "../../hooks/useEntitlements";
import { getCardSkin } from "../../lib/skins";

const TURN_TIMEOUT = 60;

export default function OnlineGameScreen() {
  const { roomCode, difficulty = "medium", botMode: botModeParam } = useLocalSearchParams<{
    roomCode: string;
    difficulty?: string;
    botMode?: string;
  }>();
  const isBotMode = botModeParam === "1";
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { avatar, userId, nickname, selectedTable } = usePlayerStats();
  const { states, equipped } = usePlayerAbilities();
  const eqAbility = states.find((s) => s.id === equipped) ?? states[0];
  const myAbility = useMemo(
    () => ({ id: eqAbility.id, level: eqAbility.level, emoji: eqAbility.emoji, nameKey: eqAbility.nameKey }),
    [eqAbility.id, eqAbility.level, eqAbility.emoji, eqAbility.nameKey],
  );
  const premium = usePremium();
  const skin = getCardSkin(selectedTable);
  const { room } = useRoom(roomCode);

  const {
    game, isHost, myTurn, lastMatchResult, revealedLocal,
    handleCardPress, handlePower, handleTornadoComplete,
  } = useOnlineGame(room, userId, isBotMode, myAbility);

  const myKey = isHost ? "p1" : "p2";
  const otherKey = isHost ? "p2" : "p1";

  // Power cast banner — fires when either player's uses drop (non-shuffle).
  const [banner, setBanner] = useState<{ emoji: string; label: string; color: HueName; nonce: number } | null>(null);
  const prevUsesRef = useRef<{ p1: number; p2: number } | null>(null);
  const castNonceRef = useRef(0);
  useEffect(() => {
    if (!game) return;
    const prev = prevUsesRef.current;
    if (prev) {
      (["p1", "p2"] as const).forEach((k) => {
        const ab = game.abilities?.[k];
        if (game.powerUsesLeft[k] < prev[k] && ab && ab.id !== "tornado") {
          castNonceRef.current += 1;
          setBanner({
            emoji: ab.emoji,
            // Level-aware magnitude, e.g. "Bouclier ×2" at shield level 2.
            label: t(`abilities.${ab.nameKey}.name`) + magnitudeSuffix(ab.id, ab.level),
            color: k === myKey ? "violet" : "coral",
            nonce: castNonceRef.current,
          });
        }
      });
    }
    prevUsesRef.current = { ...game.powerUsesLeft };
  }, [game?.powerUsesLeft?.p1, game?.powerUsesLeft?.p2]);

  // Victim feedback — when I get frozen or my pairs get stolen.
  const prevFreezeRef = useRef<number | null>(null);
  const prevScoreRef = useRef<number | null>(null);
  useEffect(() => {
    if (!game) return;
    const fz = game.freezeTurns[myKey];
    if (prevFreezeRef.current !== null && fz > prevFreezeRef.current) {
      const turns = fz - prevFreezeRef.current;
      castNonceRef.current += 1;
      setBanner({ emoji: "❄️", label: t("power.frozenYou") + (turns >= 2 ? ` ×${turns}` : ""), color: "blue", nonce: castNonceRef.current });
    }
    prevFreezeRef.current = fz;
  }, [game?.freezeTurns?.[myKey]]);
  useEffect(() => {
    if (!game) return;
    const sc = game.scores[myKey];
    if (prevScoreRef.current !== null && sc < prevScoreRef.current) {
      const stolen = prevScoreRef.current - sc;
      castNonceRef.current += 1;
      setBanner({ emoji: "🪝", label: t("power.robbed") + (stolen >= 2 ? ` ×${stolen}` : ""), color: "pink", nonce: castNonceRef.current });
    }
    prevScoreRef.current = sc;
  }, [game?.scores?.[myKey]]);

  // Ghost bot plays as guest when botMode is active
  useBotPlayer(room, game, difficulty as CpuDifficulty, isBotMode);

  const gameStartRef = useRef(Date.now());
  const [turnTimer, setTurnTimer] = useState(TURN_TIMEOUT);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const forfeitTriggeredRef = useRef(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  // Defer LoadingCard mount so a fast InstantDB query doesn't flash the
  // generic loading screen on top of the skin board for ~100-300 ms.
  const [loadingVisible, setLoadingVisible] = useState(false);
  useEffect(() => {
    if (game && room) {
      setLoadingVisible(false);
      return;
    }
    const timer = setTimeout(() => setLoadingVisible(true), 250);
    return () => clearTimeout(timer);
  }, [game, room]);

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
        tornadoUsed: (abilityEffect(game.abilities[myKey].id, game.abilities[myKey].level).uses - game.powerUsesLeft[myKey]).toString(),
        powerEmoji: game.abilities[myKey].emoji,
        powerNameKey: game.abilities[myKey].nameKey,
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
            tornadoUsed: (abilityEffect(game.abilities[myKey].id, game.abilities[myKey].level).uses - game.powerUsesLeft[myKey]).toString(),
        powerEmoji: game.abilities[myKey].emoji,
        powerNameKey: game.abilities[myKey].nameKey,
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
      }, { skip: premium });
    }
  }, [game?.status, room?.status, premium]);

  const chatter = useGameChatter({
    lastMatchResult,
    currentTurn: (game?.currentTurn ?? 1) as 1 | 2,
    status: game?.status ?? "loading",
    meIsPlayer: isHost ? 1 : 2,
    playerAvatar: avatar,
    opponentAvatar,
    playerName: myName,
    opponentName,
  });

  // --- Loading ---
  if (!game || !room) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
        {loadingVisible && <LoadingCard />}
      </SafeAreaView>
    );
  }

  const gridConfig = GRID_CONFIG[(difficulty as CpuDifficulty) ?? "medium"];
  const totalPairs = gridConfig.totalCards / 2;
  const myScore = isHost ? game.scores.p1 : game.scores.p2;
  const opponentScore = isHost ? game.scores.p2 : game.scores.p1;
  const canUsePower =
    myTurn && game.powerUsesLeft[myKey] > 0 && !game.locked && !game.tornadoActive && game.status === "playing";
  const myBuild = { emoji: game.abilities[myKey].emoji, name: t(`abilities.${game.abilities[myKey].nameKey}.name`) };
  const oppBuild = { emoji: game.abilities[otherKey].emoji, name: t(`abilities.${game.abilities[otherKey].nameKey}.name`) };
  const timeLow = turnTimer <= 10;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 }}>
        {/* Top bar — back */}
        <View style={{ marginBottom: 10 }}>
          <IconBtn color="white" onPress={confirmQuit}>
            ✕
          </IconBtn>
        </View>

        {/* Battle HUD — you vs opponent + score + bubbles + 60s turn timer */}
        <BattleHUD
          player={{ avatar, name: myName, score: myScore, active: myTurn }}
          opponent={{ avatar: opponentAvatar, name: opponentName, score: opponentScore, active: !myTurn }}
          matched={myScore + opponentScore}
          totalPairs={totalPairs}
          chatter={chatter}
          timer={{ text: `${turnTimer}s`, low: timeLow }}
          playerBadge={game.shieldCharges[myKey] > 0 ? { icon: "🛡️", count: game.shieldCharges[myKey], color: "green" } : null}
          opponentBadge={game.freezeTurns[otherKey] > 0 ? { icon: "❄️", count: game.freezeTurns[otherKey], color: "blue" } : null}
          playerBuild={myBuild}
          opponentBuild={oppBuild}
        />

        <View style={{ height: 12 }} />

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
            revealed={revealedLocal}
            onCardPress={handleCardPress}
            cols={gridConfig.cols}
            skin={skin}
          />
          <MatchFeedback result={lastMatchResult} />
          {banner && (
            <PowerCastBanner
              key={banner.nonce}
              emoji={banner.emoji}
              label={banner.label}
              color={banner.color}
              onDone={() => setBanner(null)}
            />
          )}
        </View>

        {/* Equipped-ability power */}
        <ActionBar
          emoji={game.abilities[myKey].emoji}
          name={t(`abilities.${game.abilities[myKey].nameKey}.name`)}
          usesLeft={game.powerUsesLeft[myKey]}
          canUse={canUsePower}
          onPress={handlePower}
          shieldCharges={game.shieldCharges[myKey]}
          freezeTurns={game.freezeTurns[otherKey]}
        />
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
