import { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { CardItem, type CardSkin } from './CardItem';
import { RoyalBoardBackground } from './royal/RoyalBoardBackground';
import { InfernoBoardBackground } from './inferno/InfernoBoardBackground';
import { HeavenBoardBackground } from './heaven/HeavenBoardBackground';
import type { MatchResult } from '../../hooks/useLocalGame';

const GAP = 8;

interface GameGridProps {
  positions: number[];
  cardEmojis: string[];
  selected: number[];
  matchedBy: number[];
  locked: boolean;
  currentTurn: 1 | 2;
  lastMatchResult: MatchResult;
  tornadoActive: boolean;
  revealed?: number[];
  onCardPress: (cardId: number) => void;
  cols?: number;
  skin?: CardSkin;
}

function AnimatedCardSlot({
  index,
  tornadoActive,
  cols,
  cardSize,
  children,
}: {
  index: number;
  tornadoActive: boolean;
  cols: number;
  cardSize: number;
  children: React.ReactNode;
}) {
  const impactRotate = useSharedValue(0);
  const impactY = useSharedValue(0);
  const impactScale = useSharedValue(1);

  useEffect(() => {
    if (!tornadoActive) {
      impactRotate.value = 0;
      impactY.value = 0;
      impactScale.value = 1;
      return;
    }

    const row = Math.floor(index / cols);
    const rowDelay = 1400 + row * 800;

    impactRotate.value = withDelay(
      rowDelay,
      withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(10, { duration: 80 }),
        withTiming(-6, { duration: 70 }),
        withTiming(8, { duration: 70 }),
        withTiming(-3, { duration: 60 }),
        withTiming(0, { duration: 80 }),
      ),
    );

    impactY.value = withDelay(
      rowDelay,
      withSequence(
        withTiming(-6, { duration: 60 }),
        withTiming(8, { duration: 80 }),
        withTiming(-5, { duration: 70 }),
        withTiming(4, { duration: 70 }),
        withTiming(0, { duration: 100 }),
      ),
    );

    impactScale.value = withDelay(
      rowDelay,
      withSequence(
        withTiming(0.88, { duration: 100 }),
        withSpring(1, { damping: 8, stiffness: 200 }),
      ),
    );
  }, [tornadoActive]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: impactScale.value },
      { translateY: impactY.value },
      { rotateZ: `${impactRotate.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[style, { width: cardSize, height: cardSize }]}>
      {children}
    </Animated.View>
  );
}

export function GameGrid({
  positions,
  cardEmojis,
  selected,
  matchedBy,
  locked,
  currentTurn,
  lastMatchResult,
  tornadoActive,
  revealed,
  onCardPress,
  cols = 4,
  skin = 'classic',
}: GameGridProps) {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const totalCards = positions.length;
  const gridIndices = useMemo(
    () => Array.from({ length: totalCards }, (_, i) => i),
    [totalCards],
  );

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setDims({ w: width, h: height });
  }, []);

  // Pick the column count (≤ the configured one) that yields the biggest
  // square card — so few-card boards (6/8 pairs) grow to fill the space
  // instead of staying narrow at a fixed 4 columns.
  const { effectiveCols, cardSize } = useMemo(() => {
    if (!dims) return { effectiveCols: cols, cardSize: 0 };
    let best = { c: cols, s: 0 };
    for (let c = 2; c <= cols; c++) {
      const r = Math.ceil(totalCards / c);
      const w = (dims.w - (c - 1) * GAP) / c;
      const h = (dims.h - (r - 1) * GAP) / r;
      const s = Math.min(w, h);
      if (s > best.s) best = { c, s };
    }
    return { effectiveCols: best.c, cardSize: Math.floor(best.s) };
  }, [dims, cols, totalCards]);

  const grid = (
    <View
      onLayout={onLayout}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 }}
    >
      {cardSize > 0 && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: GAP,
            justifyContent: 'center',
            width: effectiveCols * cardSize + (effectiveCols - 1) * GAP,
          }}
        >
          {gridIndices.map((gridIdx) => {
            const cardId = positions[gridIdx];
            const emoji = cardEmojis[cardId];
            const isRevealed = revealed?.includes(cardId) ?? false;
            const isFaceUp =
              selected.includes(cardId) || matchedBy[cardId] !== -1 || isRevealed;
            const isDisabled =
              matchedBy[cardId] !== -1 || locked || isRevealed;

            const isJustMatched =
              lastMatchResult?.type === 'match' &&
              lastMatchResult.cards.includes(cardId);
            const isJustMismatched =
              lastMatchResult?.type === 'mismatch' &&
              lastMatchResult.cards.includes(cardId);

            return (
              <AnimatedCardSlot
                key={gridIdx}
                index={gridIdx}
                tornadoActive={tornadoActive}
                cols={effectiveCols}
                cardSize={cardSize}
              >
                <CardItem
                  cardId={cardId}
                  emoji={emoji}
                  isFaceUp={isFaceUp}
                  matchedBy={matchedBy[cardId]}
                  isJustMatched={isJustMatched}
                  isJustMismatched={isJustMismatched}
                  onPress={onCardPress}
                  disabled={isDisabled}
                  skin={skin}
                />
              </AnimatedCardSlot>
            );
          })}
        </View>
      )}
    </View>
  );

  if (skin === 'royal') {
    return <RoyalBoardBackground>{grid}</RoyalBoardBackground>;
  }
  if (skin === 'inferno') {
    return <InfernoBoardBackground>{grid}</InfernoBoardBackground>;
  }
  if (skin === 'heaven') {
    return <HeavenBoardBackground>{grid}</HeavenBoardBackground>;
  }
  return grid;
}
