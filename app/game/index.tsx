import { BackHandler, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HandPointer } from "../../components/onboarding/HandPointer";
import { useTranslation } from "react-i18next";
import { useLocalGame } from "../../hooks/useLocalGame";
import { abilityEffect, magnitudeSuffix, randomBotAbility, usePlayerAbilities } from "../../lib/abilities";
import { GameGrid } from "../../components/game/GameGrid";
import { formatTime } from "../../components/game/PlayerHUD";
import { BattleHUD } from "../../components/game/arcade/BattleHUD";
import { useGameChatter } from "../../components/game/arcade/useGameChatter";
import { IconBtn } from "@/components/ui/arcade";
import { ActionBar } from "../../components/game/ActionBar";
import { TornadoOverlay } from "../../components/game/TornadoOverlay";
import { PowerCastBanner } from "../../components/game/PowerCastBanner";
import type { HueName } from "@/components/ui/theme";
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

  // Equipped ability → in-game power for P1.
  const { states, equipped } = usePlayerAbilities();
  const equippedAbility = states.find((s) => s.id === equipped) ?? states[0];
  const effect = useMemo(
    () => abilityEffect(equippedAbility.id, equippedAbility.level),
    [equippedAbility.id, equippedAbility.level],
  );
  const myAbility = useMemo(
    () => ({
      id: equippedAbility.id,
      level: equippedAbility.level,
      emoji: equippedAbility.emoji,
      nameKey: equippedAbility.nameKey,
    }),
    [equippedAbility.id, equippedAbility.level, equippedAbility.emoji, equippedAbility.nameKey],
  );

  // The CPU gets a random equipped ability (not always tornado).
  const cpuAbility = useMemo(() => randomBotAbility(), []);
  const { game, lastMatchResult, handleCardPress, handlePower, handleTornadoComplete } =
    useLocalGame(difficulty as CpuDifficulty, myAbility, cpuAbility);

  const cpu = CPU_PROFILES[difficulty] ?? CPU_PROFILES.medium;
  const [turnTimer, setTurnTimer] = useState(0);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameStartRef = useRef(Date.now());

  // "Power cast!" banner — shown when P1 fires a non-shuffle ability
  // (shuffle already has the TornadoOverlay).
  const [banner, setBanner] = useState<{ emoji: string; label: string; color: HueName; nonce: number } | null>(null);
  const prevUsesRef = useRef(game.powerUsesLeft.p1);
  const castNonceRef = useRef(0);
  useEffect(() => {
    if (game.powerUsesLeft.p1 < prevUsesRef.current && effect.kind !== "shuffle") {
      castNonceRef.current += 1;
      setBanner({
        emoji: equippedAbility.emoji,
        // Level-aware magnitude, e.g. "Bouclier ×2" at shield level 2.
        label: t(`abilities.${equippedAbility.nameKey}.name`) + magnitudeSuffix(equippedAbility.id, equippedAbility.level),
        color: equippedAbility.hue,
        nonce: castNonceRef.current,
      });
    }
    prevUsesRef.current = game.powerUsesLeft.p1;
  }, [game.powerUsesLeft.p1]);

  // Victim feedback — tell P1 when the CPU froze them or stole their pairs.
  const prevFreezeRef = useRef(game.freezeTurns.p1);
  const prevScoreRef = useRef(game.scores.p1);
  useEffect(() => {
    const turns = game.freezeTurns.p1 - prevFreezeRef.current;
    if (turns > 0) {
      castNonceRef.current += 1;
      setBanner({ emoji: "❄️", label: t("power.frozenYou") + (turns >= 2 ? ` ×${turns}` : ""), color: "blue", nonce: castNonceRef.current });
    }
    prevFreezeRef.current = game.freezeTurns.p1;
  }, [game.freezeTurns.p1]);
  useEffect(() => {
    const stolen = prevScoreRef.current - game.scores.p1;
    if (stolen > 0) {
      castNonceRef.current += 1;
      setBanner({ emoji: "🪝", label: t("power.robbed") + (stolen >= 2 ? ` ×${stolen}` : ""), color: "pink", nonce: castNonceRef.current });
    }
    prevScoreRef.current = game.scores.p1;
  }, [game.scores.p1]);

  // One-time contextual hint: introduce the equipped-ability power the first
  // time it becomes usable. Dismisses once used (or tapped) and never again.
  const [powerTipSeen, setPowerTipSeen] = useState<boolean | null>(null);
  useEffect(() => {
    AsyncStorage.getItem("power_tip_seen").then((v) => setPowerTipSeen(v === "true"));
  }, []);
  const dismissPowerTip = useCallback(() => {
    setPowerTipSeen(true);
    AsyncStorage.setItem("power_tip_seen", "true");
  }, []);
  useEffect(() => {
    if (powerTipSeen === false && game.powerUsesLeft.p1 < effect.uses) dismissPowerTip();
  }, [game.powerUsesLeft.p1, powerTipSeen, effect.uses, dismissPowerTip]);

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
            tornadoUsed: (effect.uses - game.powerUsesLeft.p1).toString(),
            powerEmoji: game.abilities.p1.emoji,
            powerNameKey: game.abilities.p1.nameKey,
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

  const canUsePower =
    game.currentTurn === 1 &&
    game.powerUsesLeft.p1 > 0 &&
    !game.locked &&
    !game.tornadoActive &&
    game.status === "playing";
  const showPowerTip = powerTipSeen === false && canUsePower;

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
          playerBadge={game.shieldCharges.p1 > 0 ? { icon: "🛡️", count: game.shieldCharges.p1, color: "green" } : null}
          opponentBadge={game.freezeTurns.p2 > 0 ? { icon: "❄️", count: game.freezeTurns.p2, color: "blue" } : null}
          playerBuild={{ emoji: game.abilities.p1.emoji, name: t(`abilities.${game.abilities.p1.nameKey}.name`) }}
          opponentBuild={{ emoji: game.abilities.p2.emoji, name: t(`abilities.${game.abilities.p2.nameKey}.name`) }}
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
            revealed={game.revealed}
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
        <View>
          {showPowerTip && (
            <Pressable
              onPress={dismissPowerTip}
              style={{ position: "absolute", bottom: "100%", left: 0, right: 0, marginBottom: 8, alignItems: "center", zIndex: 20 }}
            >
              <View
                style={{
                  maxWidth: "88%",
                  backgroundColor: colors.hues.violet[0],
                  borderRadius: 16,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  boxShadow: `0 4px 0 ${colors.hues.violet[1]}, 0 12px 24px -10px ${colors.panelShadow}`,
                }}
              >
                <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 14, color: "#fff", textAlign: "center" }}>
                  {t("power.firstTip", { emoji: equippedAbility.emoji })}
                </Text>
                <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 11.5, color: "rgba(255,255,255,0.85)", textAlign: "center", marginTop: 2 }}>
                  {t("power.firstTipSub")}
                </Text>
              </View>
              <HandPointer pointing="down" size={34} style={{ right: 24, bottom: -26 }} />
            </Pressable>
          )}
          <ActionBar
            emoji={equippedAbility.emoji}
            name={t(`abilities.${equippedAbility.nameKey}.name`)}
            usesLeft={game.powerUsesLeft.p1}
            canUse={canUsePower}
            onPress={handlePower}
            shieldCharges={game.shieldCharges.p1}
            freezeTurns={game.freezeTurns.p2}
          />
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
