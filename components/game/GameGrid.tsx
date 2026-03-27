import { View } from 'react-native';
import { CardItem } from './CardItem';

interface GameGridProps {
  positions: number[];
  cardEmojis: string[];
  selected: number[];
  matchedBy: number[];
  locked: boolean;
  currentTurn: 1 | 2;
  onCardPress: (cardId: number) => void;
}

export function GameGrid({
  positions,
  cardEmojis,
  selected,
  matchedBy,
  locked,
  currentTurn,
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

          return (
            <View
              key={gridIdx}
              style={{
                width: '22%',
                aspectRatio: 1,
              }}
            >
              <CardItem
                cardId={cardId}
                emoji={emoji}
                isFaceUp={isFaceUp}
                matchedBy={matchedBy[cardId]}
                onPress={onCardPress}
                disabled={isDisabled}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}
