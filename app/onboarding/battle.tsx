import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";
import { haptics } from "../../lib/haptics";
import { playFlip, playMatch } from "../../lib/sound";
import { CardItem } from "../../components/game/CardItem";
import { BattleHUD } from "../../components/game/arcade/BattleHUD";
import { useGameChatter } from "../../components/game/arcade/useGameChatter";
import { usePlayerStats } from "../../lib/playerStats";
import { BRIGADE_CHIEF } from "../../lib/story";
import { VILLAGE_BG, VILLAGE_DECOR } from "../../lib/storyEpilogue";
import { HandPointer } from "../../components/onboarding/HandPointer";
import type { MatchResult } from "../../hooks/useLocalGame";

// Pre-shuffled 2x4 grid — 4 pairs
const EMOJIS = ["🐶", "🦊", "🐸", "🐱", "🐱", "🐶", "🐸", "🦊"];
const TOTAL_PAIRS = 4;

// Memoized card: only the cards whose props actually change re-render on
// each flip, instead of the whole grid.
const MemoCard = memo(CardItem);

type TooltipData = { text: string; type: "info" | "success" | "error"; key: number };

function Tooltip({ text, type }: { text: string; type: TooltipData["type"] }) {
  const { colors } = useTheme();
  const hue =
    type === "success" ? colors.hues.green : type === "error" ? colors.hues.coral : colors.hues.violet;
  const [c, cd] = hue;
  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      style={{
        backgroundColor: c,
        borderRadius: 18,
        paddingHorizontal: 24,
        paddingVertical: 14,
        alignSelf: "stretch",
        marginHorizontal: 4,
        boxShadow: `0 4px 0 ${cd}`,
      }}
    >
      <Text style={{ color: "#FFF", fontFamily: "Fredoka_700Bold", fontSize: 18, textAlign: "center" }}>{text}</Text>
    </Animated.View>
  );
}

export default function BattleScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { avatar, nickname } = usePlayerStats();
  const { replay } = useLocalSearchParams<{ replay?: string }>();

  const [selected, setSelected] = useState<number[]>([]);
  const [matchedBy, setMatchedBy] = useState<number[]>(Array(8).fill(-1));
  const [turn, setTurn] = useState<1 | 2>(1);
  const [scoreP1, setScoreP1] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);
  const [lastMatch, setLastMatch] = useState<{ cards: number[]; type: "match" | "mismatch"; player: 1 | 2 } | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData>({ text: "", type: "info", key: 0 });
  const [gridDims, setGridDims] = useState<{ w: number; h: number } | null>(null);
  const lockedRef = useRef(false);
  const keyRef = useRef(0);

  // Refs to avoid stale closures in resolve/cpuTurn chains
  const matchedByRef = useRef(matchedBy);
  matchedByRef.current = matchedBy;
  const scoreP1Ref = useRef(scoreP1);
  scoreP1Ref.current = scoreP1;
  const scoreP2Ref = useRef(scoreP2);
  scoreP2Ref.current = scoreP2;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const turnRef = useRef(turn);
  turnRef.current = turn;

  const showTooltip = useCallback((text: string, type: TooltipData["type"]) => {
    keyRef.current += 1;
    setTooltip({ text, type, key: keyRef.current });
  }, []);

  // Story beat: the Brigade Chief taunts the hero before the fight begins.
  // Then the tutorial happens inside the fight: tooltip + hand pointer.
  const [showHand, setShowHand] = useState(false);
  useEffect(() => {
    lockedRef.current = true;
    showTooltip(t("story.brigadeChief.intro"), "error");
    const timer = setTimeout(() => {
      lockedRef.current = false;
      showTooltip(t("onboarding.battle.yourTurn"), "info");
      setShowHand(true);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  // The story flows straight on: no score screen, the epilogue tells the
  // outcome narratively (villagers' thanks or the Lion's rescue).
  const goToResult = (p1: number, p2: number) => {
    setTimeout(() => {
      const result = p1 > p2 ? "won" : p1 < p2 ? "lost" : "draw";
      router.replace({
        pathname: "/onboarding/epilogue",
        params: { result, ...(replay === "1" ? { replay: "1" } : {}) },
      });
    }, 1200);
  };

  const resolve = useCallback((a: number, b: number, player: 1 | 2) => {
    if (EMOJIS[a] === EMOJIS[b]) {
      haptics.match();
      playMatch();
      const next = [...matchedByRef.current];
      next[a] = player;
      next[b] = player;
      setMatchedBy(next);
      matchedByRef.current = next;
      setLastMatch({ cards: [a, b], type: "match", player });

      const newP1 = player === 1 ? scoreP1Ref.current + 1 : scoreP1Ref.current;
      const newP2 = player === 2 ? scoreP2Ref.current + 1 : scoreP2Ref.current;
      if (player === 1) setScoreP1(newP1); else setScoreP2(newP2);
      scoreP1Ref.current = newP1;
      scoreP2Ref.current = newP2;

      if (newP1 + newP2 >= TOTAL_PAIRS) { goToResult(newP1, newP2); return; }

      showTooltip(player === 1 ? t("onboarding.battle.matchFound") : t("onboarding.battle.cpuMatch"), player === 1 ? "success" : "error");
      setSelected([]);
      lockedRef.current = false;
      if (player === 2) setTimeout(() => cpuTurn(next), 1200);
    } else {
      setLastMatch({ cards: [a, b], type: "mismatch", player });
      showTooltip(player === 1 ? t("onboarding.battle.mismatch") : t("onboarding.battle.cpuMiss"), player === 1 ? "error" : "info");
      setTimeout(() => {
        setSelected([]);
        setLastMatch(null);
        lockedRef.current = false;
        if (player === 1) {
          setTurn(2);
          setTimeout(() => cpuTurn(matchedByRef.current), 800);
        } else {
          setTurn(1);
          showTooltip(t("onboarding.battle.yourTurn"), "info");
        }
      }, 900);
    }
  }, []);

  // Stable identity (reads via refs) so memoized cards don't re-render on
  // every selection change.
  const handleCardPress = useCallback((cardId: number) => {
    if (lockedRef.current || turnRef.current !== 1 || matchedByRef.current[cardId] !== -1 || selectedRef.current.includes(cardId)) return;
    setShowHand(false);
    haptics.flip();
    playFlip();
    const nextSelected = [...selectedRef.current, cardId];
    setSelected(nextSelected);
    if (nextSelected.length === 2) {
      lockedRef.current = true;
      setTimeout(() => resolve(nextSelected[0], nextSelected[1], 1), 500);
    }
  }, [resolve]);

  const cpuTurn = useCallback((currentMatchedBy: number[]) => {
    showTooltip(t("onboarding.battle.cpuTurn"), "info");
    lockedRef.current = true;
    const available = EMOJIS.map((_, i) => i).filter((i) => currentMatchedBy[i] === -1);
    if (available.length < 2) return;

    // Scripted guaranteed win: the tutorial bot deliberately MISSES — it picks
    // two non-matching cards whenever possible, so the player always wins.
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    let first = shuffled[0];
    let second = shuffled[1];
    const mismatch = shuffled.find((j) => j !== first && EMOJIS[j] !== EMOJIS[first]);
    if (mismatch !== undefined) {
      second = mismatch;
    } else {
      // Only matching pairs remain (very end) — bob a card, then resolve.
      const alt = available.find((j) => j !== first);
      if (alt !== undefined) second = alt;
    }

    setTimeout(() => {
      setSelected([first]);
      setTimeout(() => {
        setSelected([first, second]);
        setTimeout(() => resolve(first, second, 2), 500);
      }, 800);
    }, 1000);
  }, [resolve]);

  // Memoize so the reference only changes when `lastMatch` changes — otherwise
  // a fresh object every render retriggers useGameChatter's effect → infinite loop.
  const matchResult: MatchResult = useMemo(
    () =>
      lastMatch
        ? { type: lastMatch.type, player: lastMatch.player, cards: [lastMatch.cards[0], lastMatch.cards[1]] }
        : null,
    [lastMatch],
  );
  const chatter = useGameChatter({
    lastMatchResult: matchResult,
    currentTurn: turn,
    status: "playing",
    playerAvatar: avatar,
    opponentAvatar: BRIGADE_CHIEF.avatar,
    playerName: nickname || t("game.you"),
    opponentName: BRIGADE_CHIEF.name,
  });

  // 8 cards on a 4×2 grid — sized to fit but capped so they don't grow huge.
  const MAX_CARD = 84;
  const { gCols, cardSize } = useMemo(() => {
    if (!gridDims) return { gCols: 4, cardSize: 0 };
    const c = 4;
    const r = Math.ceil(EMOJIS.length / c);
    const w = (gridDims.w - (c - 1) * 8) / c;
    const h = (gridDims.h - (r - 1) * 8) / r;
    const s = Math.min(w, h, MAX_CARD);
    return { gCols: c, cardSize: Math.floor(s) };
  }, [gridDims]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: VILLAGE_BG[0] }}>
      <StatusBar style="light" />
      {/* Burning-village ambiance — the fight takes place where Gromak struck */}
      <LinearGradient colors={VILLAGE_BG} style={StyleSheet.absoluteFill} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 }}>
        {/* Battle HUD — same as the real game */}
        <BattleHUD
          player={{ avatar, name: t("game.you"), score: scoreP1, active: turn === 1 }}
          opponent={{ avatar: BRIGADE_CHIEF.avatar, name: BRIGADE_CHIEF.name, score: scoreP2, active: turn === 2 }}
          matched={scoreP1 + scoreP2}
          totalPairs={TOTAL_PAIRS}
          chatter={chatter}
        />

        <View style={{ height: 12 }} />

        {/* Tooltip (tutorial guidance — unchanged) */}
        <View style={{ minHeight: 44, marginBottom: 4 }}>
          <Tooltip key={tooltip.key} text={tooltip.text} type={tooltip.type} />
        </View>

        {/* Village skyline under attack */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 22,
            marginTop: 6,
            opacity: 0.85,
          }}
        >
          {VILLAGE_DECOR.map((emoji, i) => (
            <Text key={i} style={{ fontSize: 20 }}>{emoji}</Text>
          ))}
        </View>

        {/* Grid using real CardItem — cards grow to fill the board */}
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 4 }}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setGridDims({ w: width, h: height });
          }}
        >
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "center",
              width: cardSize > 0 ? gCols * cardSize + (gCols - 1) * 8 : "100%",
            }}
          >
            {/* Tutorial hand: taps over the first card until the player flips one */}
            {showHand && cardSize > 0 && (
              <HandPointer
                pointing="down"
                style={{ top: -34, left: cardSize / 2 - 10, zIndex: 10 }}
              />
            )}
            {EMOJIS.map((emoji, idx) => (
              <View key={idx} style={{ width: cardSize > 0 ? cardSize : "22%", height: cardSize > 0 ? cardSize : undefined, aspectRatio: cardSize > 0 ? undefined : 1 }}>
                <MemoCard
                  cardId={idx}
                  emoji={emoji}
                  isFaceUp={selected.includes(idx) || matchedBy[idx] !== -1}
                  matchedBy={matchedBy[idx]}
                  isJustMatched={lastMatch?.type === "match" && lastMatch.cards.includes(idx)}
                  isJustMismatched={lastMatch?.type === "mismatch" && lastMatch.cards.includes(idx)}
                  onPress={handleCardPress}
                  disabled={turn !== 1 || matchedBy[idx] !== -1}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
