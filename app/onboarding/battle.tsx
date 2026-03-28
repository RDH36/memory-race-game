import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";
import { CardItem } from "../../components/game/CardItem";
import { OpponentCard, ProgressDots, formatTime } from "../../components/game/PlayerHUD";
import { usePlayerStats } from "../../lib/playerStats";

// Pre-shuffled 2x4 grid — 4 pairs
const EMOJIS = ["🐶", "🦊", "🐸", "🐱", "🐱", "🐶", "🐸", "🦊"];
const TOTAL_PAIRS = 4;

type TooltipData = { text: string; type: "info" | "success" | "error"; key: number };

function Tooltip({ text, type }: { text: string; type: TooltipData["type"] }) {
  const { colors } = useTheme();
  const bg = type === "success" ? colors.success : type === "error" ? colors.p2 : colors.primaryContainer;
  return (
    <Animated.View entering={FadeInDown.duration(250)} style={{ backgroundColor: bg, borderRadius: 18, paddingHorizontal: 24, paddingVertical: 14, alignSelf: "stretch", marginHorizontal: 4 }}>
      <Text style={{ color: "#FFF", fontFamily: "Fredoka_700Bold", fontSize: 18, textAlign: "center" }}>{text}</Text>
    </Animated.View>
  );
}

export default function BattleScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { avatar } = usePlayerStats();

  const [selected, setSelected] = useState<number[]>([]);
  const [matchedBy, setMatchedBy] = useState<number[]>(Array(8).fill(-1));
  const [turn, setTurn] = useState<1 | 2>(1);
  const [scoreP1, setScoreP1] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);
  const [lastMatch, setLastMatch] = useState<{ cards: number[]; type: "match" | "mismatch"; player: 1 | 2 } | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData>({ text: "", type: "info", key: 0 });
  const [turnTimer, setTurnTimer] = useState(0);
  const lockedRef = useRef(false);
  const keyRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = useCallback((text: string, type: TooltipData["type"]) => {
    keyRef.current += 1;
    setTooltip({ text, type, key: keyRef.current });
  }, []);

  useEffect(() => { showTooltip(t("onboarding.battle.yourTurn"), "info"); }, []);

  // Turn timer
  useEffect(() => {
    setTurnTimer(0);
    timerRef.current = setInterval(() => setTurnTimer((p) => p + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [turn]);

  const goToResult = (p1: number, p2: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => {
      router.replace({ pathname: "/onboarding/result", params: { p1: String(p1), p2: String(p2) } });
    }, 1200);
  };

  const resolve = useCallback((a: number, b: number, player: 1 | 2) => {
    if (EMOJIS[a] === EMOJIS[b]) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const next = [...matchedBy];
      next[a] = player;
      next[b] = player;
      setMatchedBy(next);
      setLastMatch({ cards: [a, b], type: "match", player });

      const newP1 = player === 1 ? scoreP1 + 1 : scoreP1;
      const newP2 = player === 2 ? scoreP2 + 1 : scoreP2;
      if (player === 1) setScoreP1(newP1); else setScoreP2(newP2);

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
          setTimeout(() => cpuTurn(matchedBy), 800);
        } else {
          setTurn(1);
          showTooltip(t("onboarding.battle.yourTurn"), "info");
        }
      }, 900);
    }
  }, [matchedBy, scoreP1, scoreP2]);

  const handleCardPress = useCallback((cardId: number) => {
    if (lockedRef.current || turn !== 1 || matchedBy[cardId] !== -1 || selected.includes(cardId)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextSelected = [...selected, cardId];
    setSelected(nextSelected);
    if (nextSelected.length === 2) {
      lockedRef.current = true;
      setTimeout(() => resolve(nextSelected[0], nextSelected[1], 1), 500);
    }
  }, [turn, selected, matchedBy]);

  const cpuTurn = useCallback((currentMatchedBy: number[]) => {
    showTooltip(t("onboarding.battle.cpuTurn"), "info");
    lockedRef.current = true;
    const available = EMOJIS.map((_, i) => i).filter((i) => currentMatchedBy[i] === -1);
    if (available.length < 2) return;
    const shuffled = [...available].sort(() => Math.random() - 0.5);

    setTimeout(() => {
      setSelected([shuffled[0]]);
      setTimeout(() => {
        setSelected([shuffled[0], shuffled[1]]);
        setTimeout(() => resolve(shuffled[0], shuffled[1], 2), 500);
      }, 800);
    }, 1000);
  }, [resolve]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 }}>
        {/* Opponent card — BabyBot */}
        <OpponentCard
          name="BabyBot"
          subtitle={`🤖 ${t("game.ia")} · ${t("home.difficulty.easy")}`}
          avatar="🐣"
          pairsMatched={scoreP2}
          totalPairs={TOTAL_PAIRS}
          isActive={turn === 2}
          timerSeconds={turn === 2 ? turnTimer : 0}
        />

        {/* Score */}
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "center", marginVertical: 8 }}>
          <Text style={{ fontSize: 11, fontFamily: "Nunito_700Bold", color: colors.onSurfaceVariant, letterSpacing: 1, marginRight: 8 }}>
            {t("game.pairs")}
          </Text>
          <Text style={{ fontSize: 18, fontFamily: "Fredoka_700Bold", color: colors.p1 }}>{scoreP1}</Text>
          <Text style={{ fontSize: 14, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginHorizontal: 6 }}>—</Text>
          <Text style={{ fontSize: 18, fontFamily: "Fredoka_700Bold", color: colors.p2 }}>{scoreP2}</Text>
          <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginLeft: 4 }}>/ {TOTAL_PAIRS}</Text>
        </View>

        {/* Tooltip */}
        <View style={{ minHeight: 44, marginBottom: 4 }}>
          <Tooltip key={tooltip.key} text={tooltip.text} type={tooltip.type} />
        </View>

        {/* Grid 2x4 using real CardItem */}
        <View style={{ flex: 1, justifyContent: "center" }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", paddingHorizontal: 4 }}>
            {EMOJIS.map((emoji, idx) => (
              <View key={idx} style={{ width: "22%", aspectRatio: 1 }}>
                <CardItem
                  cardId={idx}
                  emoji={emoji}
                  isFaceUp={selected.includes(idx) || matchedBy[idx] !== -1}
                  matchedBy={matchedBy[idx]}
                  isJustMatched={lastMatch?.type === "match" && lastMatch.cards.includes(idx)}
                  isJustMismatched={lastMatch?.type === "mismatch" && lastMatch.cards.includes(idx)}
                  onPress={handleCardPress}
                  disabled={lockedRef.current || turn !== 1 || matchedBy[idx] !== -1}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Player bar */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, gap: 10 }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primaryContainerBg, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 18 }}>{avatar}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontFamily: "Fredoka_600SemiBold", color: colors.onSurface }}>{t("game.you")}</Text>
            <Text style={{ fontSize: 11, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant }}>{t("game.player")}</Text>
          </View>
          <ProgressDots filled={scoreP1} total={TOTAL_PAIRS} />
          <View style={{ backgroundColor: turn === 1 ? colors.primaryContainerBg : isDark ? "#2A2A2A" : "#F5F2F2", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }}>
            <Text style={{ fontSize: 14, fontFamily: "Fredoka_600SemiBold", color: turn === 1 ? colors.primaryContainer : colors.onSurfaceVariant }}>
              {formatTime(turn === 1 ? turnTimer : 0)}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
