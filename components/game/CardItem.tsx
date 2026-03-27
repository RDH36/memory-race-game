import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface CardItemProps {
  cardId: number;
  emoji: string;
  isFaceUp: boolean;
  matchedBy: number;
  onPress: (cardId: number) => void;
  disabled: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function CardItem({
  cardId,
  emoji,
  isFaceUp,
  matchedBy,
  onPress,
  disabled,
}: CardItemProps) {
  const rotateY = useSharedValue(0);

  useEffect(() => {
    rotateY.value = withTiming(isFaceUp ? 180 : 0, {
      duration: 320,
    });
  }, [isFaceUp, rotateY]);

  const backAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateY: `${interpolate(rotateY.value, [0, 180], [0, 180])}deg` }],
    };
  });

  const frontAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateY: `${interpolate(rotateY.value, [0, 180], [180, 360])}deg` }],
    };
  });

  const getBackgroundColor = () => {
    if (matchedBy === 1) return '#E6F1FB';
    if (matchedBy === 2) return '#FAECE7';
    return '#E6F1FB';
  };

  const getBorderColor = () => {
    if (matchedBy === 1) return '#378ADD';
    if (matchedBy === 2) return '#D85A30';
    return '#378ADD';
  };

  return (
    <Pressable
      onPress={() => onPress(cardId)}
      disabled={disabled}
      className="aspect-square flex-1 rounded-xl"
    >
      <View className="relative w-full h-full">
        {/* Back side - shows question mark */}
        <AnimatedView
          style={[
            backAnimatedStyle,
            {
              backfaceVisibility: 'hidden',
              backgroundColor: getBackgroundColor(),
              borderColor: getBorderColor(),
              borderWidth: 2,
            },
          ]}
          className="absolute w-full h-full rounded-xl justify-center items-center"
        >
          <Text
            className="font-bold text-2xl"
            style={{ color: '#378ADD' }}
          >
            ?
          </Text>
        </AnimatedView>

        {/* Front side - shows emoji */}
        <AnimatedView
          style={[
            frontAnimatedStyle,
            {
              backfaceVisibility: 'hidden',
              backgroundColor: matchedBy === 1 ? '#E6F1FB' : matchedBy === 2 ? '#FAECE7' : '#FFFFFF',
              borderWidth: matchedBy !== -1 ? 2 : 0,
              borderColor: matchedBy === 1 ? '#378ADD' : matchedBy === 2 ? '#D85A30' : 'transparent',
            },
          ]}
          className="absolute w-full h-full rounded-xl justify-center items-center"
        >
          <Text style={{ fontSize: 28 }}>
            {emoji}
          </Text>
        </AnimatedView>
      </View>
    </Pressable>
  );
}
