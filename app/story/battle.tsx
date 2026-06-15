// Story battle — webtoon intro then the fight. Same engine as the solo game
// but with a scripted enemy, no ads, no XP/gold (chapter rewards instead).
import { useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useLocalGame } from "@/hooks/useLocalGame";
import { getAbility, usePlayerAbilities } from "@/lib/abilities";
import { GameGrid } from "@/components/game/GameGrid";
import { StoryBattleHud } from "@/components/story/StoryBattleHud";
import { ActionBar } from "@/components/game/ActionBar";
import { TornadoOverlay } from "@/components/game/TornadoOverlay";
import { MatchFeedback } from "@/components/game/MatchFeedback";
import { IrisTransition } from "@/components/onboarding/IrisTransition";
import { LivesFailModal, MistakeHearts, useMistakeBudget } from "@/components/story/lives";
import { BattleQuitModal, BattleTauntBanner, BattleTopBar } from "@/components/story/BattleTauntBanner";
import { WebtoonScroll } from "@/components/story/WebtoonScroll";
import { useTheme } from "@/lib/ThemeContext";
import { usePlayerStats } from "@/lib/playerStats";
import { GRID_CONFIG } from "@/lib/gameLogic";
import { getCardSkin } from "@/lib/skins";
import { track } from "@/lib/analytics";
import { CHAPTER_1, stepHref, useCampaign } from "@/lib/campaign";
import type { StepHref } from "@/lib/campaign";

const ev = (name: string, stepId?: string) => track(name, { chapter: CHAPTER_1.id, step: stepId });

const INTRO_MS = 2800;

export default function StoryBattleScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { step } = useLocalSearchParams<{ step?: string }>();
  const { avatar, nickname, selectedTable, lives, spendLife } = usePlayerStats();
  const { advanceStep, stepIndex } = useCampaign();
  const skin = getCardSkin(selectedTable);

  const stepIdx = Number(step ?? 0);
  // Replay of an already-cleared step: no heart cost, no mistake budget.
  const isReplay = stepIdx < stepIndex(CHAPTER_1.id);
  const stepDef = CHAPTER_1.steps[stepIdx];
  const battle = stepDef?.type === "skirmish" || stepDef?.type === "boss" ? stepDef : null;
  const enemy = battle?.enemy;
  const enemyName = enemy?.name ?? (enemy?.nameKey ? t(enemy.nameKey) : "");

  const { states, equipped } = usePlayerAbilities();
  const equippedAbility = states.find((s) => s.id === equipped) ?? states[0];
  const myAbility = useMemo(
    () => ({ id: equippedAbility.id, level: equippedAbility.level, emoji: equippedAbility.emoji, nameKey: equippedAbility.nameKey }),
    [equippedAbility.id, equippedAbility.level, equippedAbility.emoji, equippedAbility.nameKey],
  );
  // Fixed story ability — never random, the chapter script decides.
  const cpuAbility = useMemo(() => {
    const def = getAbility(battle?.cpuAbility.id ?? "tornado");
    return { id: def?.id ?? "tornado", level: battle?.cpuAbility.level ?? 1, emoji: def?.emoji ?? "🌪️", nameKey: def?.nameKey ?? "tornado" };
  }, [battle]);

  const difficulty = battle?.difficulty ?? "easy";
  const { game, lastMatchResult, handleCardPress, handlePower, handleTornadoComplete, resetGame } =
    useLocalGame(difficulty, myAbility, cpuAbility);

  // Webtoon intro → battle → victory story card, then the next step.
  const [phase, setPhase] = useState<"story" | "battle" | "outro">("story");
  const [turnTimer, setTurnTimer] = useState(0);
  const [introLock, setIntroLock] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [exitTo, setExitTo] = useState<StepHref | "back" | null>(null);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showDefeatModal, setShowDefeatModal] = useState(false);
  const [showNoHearts, setShowNoHearts] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (phase !== "battle") return;
    ev("campaign_step_started", battle?.id);
    const timeout = setTimeout(() => setIntroLock(false), INTRO_MS);
    return () => clearTimeout(timeout);
  }, [phase]);

  useEffect(() => {
    if (game.status !== "playing") return;
    setTurnTimer(0);
    timerRef.current = setInterval(() => setTurnTimer((prev) => prev + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [game.currentTurn, game.status]);

  // Each attempt costs 1 ❤️ upfront (quitting never refunds). Replays are free.
  const startBattle = (): boolean => {
    if (isReplay || spendLife()) return true;
    setShowNoHearts(true);
    return false;
  };

  const registerDefeat = (delayMs: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    ev("campaign_step_failed", battle?.id);
    setTimeout(() => setShowDefeatModal(true), delayMs);
  };

  useEffect(() => {
    if (game.status !== "finished" || finishedRef.current) return;
    if (game.scores.p1 > game.scores.p2) {
      finishedRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      advanceStep(CHAPTER_1, stepIdx);
      ev("campaign_step_completed", battle?.id);
      setTimeout(() => setPhase("outro"), 1000); // victory card before next step
    } else {
      registerDefeat(800);
    }
  }, [game.status]);

  // >3 missed pairs = defeat (shield-absorbed misses free; off in replay).
  const { mistakes, failed, reset: resetMistakes } =
    useMistakeBudget(lastMatchResult, game.shieldCharges.p1, () => registerDefeat(700), !isReplay);

  const handleRetry = () => {
    if (!startBattle()) return; // a retry is a fresh attempt — paid again
    setShowDefeatModal(false);
    finishedRef.current = false;
    resetMistakes();
    setIntroLock(true);
    setTimeout(() => setIntroLock(false), INTRO_MS);
    resetGame();
  };

  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (game.status === "playing") {
        setShowQuitModal(true);
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [game.status]);

  const canUsePower =
    !introLock &&
    !failed &&
    game.currentTurn === 1 &&
    game.powerUsesLeft.p1 > 0 &&
    !game.locked &&
    !game.tornadoActive &&
    game.status === "playing";

  const gridConfig = GRID_CONFIG[difficulty];
  const totalPairs = gridConfig.totalCards / 2;

  if (phase !== "battle") {
    const isOutro = phase === "outro";
    return (
      <View style={{ flex: 1, backgroundColor: "#05060F" }}>
        <WebtoonScroll
          panels={(isOutro ? battle?.outroPanels : battle?.panels) ?? []}
          title={t("story.chapter1.title")}
          ctaLabel={isOutro ? t("story.campaign.continue") : `${t("story.battle.cta")}${isReplay ? "" : " (1 ❤️)"}`}
          ctaEmoji={isOutro ? "▶️" : "⚔️"}
          ctaNote={isOutro || isReplay ? undefined : t("story.lives.startCost", { lives })}
          onDone={() => {
            if (isOutro) setExitTo(stepHref(CHAPTER_1, stepIdx + 1) ?? "back");
            else if (startBattle()) setPhase("battle");
          }}
        />
        {!revealed && <IrisTransition mode="in" duration={1000} onDone={() => setRevealed(true)} />}
        {exitTo && (
          <IrisTransition duration={600} onDone={() => (exitTo === "back" ? router.back() : router.replace(exitTo))} />
        )}
        <LivesFailModal
          visible={showNoHearts}
          icon="💔"
          title={t("story.lives.noHeartsTitle")}
          onLeave={() => { setShowNoHearts(false); router.back(); }}
          onRetry={() => { if (startBattle()) { setShowNoHearts(false); setPhase("battle"); } }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 }}>
        <BattleTopBar onQuit={() => (game.status === "playing" ? setShowQuitModal(true) : router.back())} />

        <StoryBattleHud
          game={game} lastMatchResult={lastMatchResult} totalPairs={totalPairs} turnTimer={turnTimer}
          avatar={avatar} nickname={nickname} enemyAvatar={enemy?.avatar ?? "👺"} enemyName={enemyName}
        />

        {introLock && battle && <BattleTauntBanner avatar={enemy?.avatar ?? "👺"} text={t(battle.enemy.introKey)} />}

        {!isReplay && <MistakeHearts mistakes={mistakes} />}

        <View style={{ flex: 1 }}>
          <GameGrid
            positions={game.positions}
            cardEmojis={game.cardEmojis}
            selected={game.selected}
            matchedBy={game.matchedBy}
            locked={introLock || failed || game.locked || game.currentTurn !== 1}
            currentTurn={game.currentTurn}
            lastMatchResult={lastMatchResult}
            tornadoActive={game.tornadoActive}
            revealed={game.revealed}
            onCardPress={handleCardPress}
            cols={gridConfig.cols}
            skin={skin}
          />
          <MatchFeedback result={lastMatchResult} />
        </View>

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

      {game.tornadoActive && <TornadoOverlay onComplete={handleTornadoComplete} />}
      {!revealed && <IrisTransition mode="in" duration={1000} onDone={() => setRevealed(true)} />}
      {exitTo && (
        <IrisTransition duration={600} onDone={() => (exitTo === "back" ? router.back() : router.replace(exitTo))} />
      )}
      <BattleQuitModal
        visible={showQuitModal}
        onCancel={() => setShowQuitModal(false)}
        onConfirm={() => { setShowQuitModal(false); router.back(); }}
      />

      <LivesFailModal
        visible={showDefeatModal}
        icon={enemy?.avatar ?? "👹"}
        title={t("story.battle.defeatTitle")}
        baseMessage={isReplay ? undefined : t("story.battle.defeatText", { name: enemyName })}
        freeRetry={isReplay}
        onLeave={() => { setShowDefeatModal(false); router.back(); }}
        onRetry={handleRetry}
      />
    </SafeAreaView>
  );
}
