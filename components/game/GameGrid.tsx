import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { CardItem } from './CardItem';
import type { MatchResult } from '../../hooks/useLocalGame';

interface GameGridProps {
  positions: number[];
  cardEmojis: string[];
  selected: number[];
  matchedBy: number[];
  locked: boolean;
  currentTurn: 1 | 2;
  lastMatchResult: MatchResult;
  tornadoActive: boolean;
  onCardPress: (cardId: number) => void;
}

function AnimatedCardSlot({
  index,
  tornadoActive,
  children,
}: {
  index: number;
  tornadoActive: boolean;
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

    const row = Math.floor(index / 4);
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
    <Animated.View style={[style, { width: '22%', aspectRatio: 1 }]}>
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
  onCardPress,
}: GameGridProps) {
  const gridIndices = Array.from({ length: 16 }, (_, i) => i);

  return (
    <View className="bg-transparent px-4 py-4 justify-center">
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          justifyContent: 'center',
        }}
      >
        {gridIndices.map((gridIdx) => {
          const cardId = positions[gridIdx];
          const emoji = cardEmojis[cardId];
          const isFaceUp =
            selected.includes(cardId) || matchedBy[cardId] !== -1;
          const isDisabled =
            matchedBy[cardId] !== -1 || locked || currentTurn !== 1;

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
              />
            </AnimatedCardSlot>
          );
        })}
      </View>
    </View>
  );
}
