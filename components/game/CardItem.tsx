import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
} from 'react-native-reanimated';

interface CardItemProps {
  cardId: number;
  emoji: string;
  isFaceUp: boolean;
  matchedBy: number;
  isJustMatched: boolean;
  isJustMismatched: boolean;
  onPress: (cardId: number) => void;
  disabled: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function CardItem({
  cardId,
  emoji,
  isFaceUp,
  matchedBy,
  isJustMatched,
  isJustMismatched,
  onPress,
  disabled,
}: CardItemProps) {
  const rotateY = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    rotateY.value = withTiming(isFaceUp ? 180 : 0, { duration: 320 });
  }, [isFaceUp, rotateY]);

  useEffect(() => {
    if (isJustMatched) {
      cardScale.value = withSequence(
        withSpring(1.12, { damping: 6, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 200 }),
      );
    }
  }, [isJustMatched, cardScale]);

  useEffect(() => {
    if (isJustMismatched) {
      shakeX.value = withSequence(
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [isJustMismatched, shakeX]);

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeX.value },
      { scale: cardScale.value },
      { rotateY: `${interpolate(rotateY.value, [0, 180], [0, 180])}deg` },
    ],
  }));

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeX.value },
      { scale: cardScale.value },
      { rotateY: `${interpolate(rotateY.value, [0, 180], [180, 360])}deg` },
    ],
  }));

  const { colors } = useTheme();

  const getBackBg = () => {
    if (matchedBy === 1) return colors.p1Bg;
    if (matchedBy === 2) return colors.p2Bg;
    return colors.p1Bg;
  };

  const getGhostBorder = () => {
    if (matchedBy === 1) return colors.p1 + '33';
    if (matchedBy === 2) return colors.p2 + '33';
    return colors.p1 + '33';
  };

  const getFrontBg = () => {
    if (matchedBy === 1) return colors.p1Bg;
    if (matchedBy === 2) return colors.p2Bg;
    return colors.surfaceContainer;
  };

  return (
    <Pressable
      onPress={() => onPress(cardId)}
      disabled={disabled}
      className="aspect-square flex-1"
      style={{ borderRadius: 8 }}
    >
      <View className="relative w-full h-full">
        {/* Back side */}
        <AnimatedView
          style={[
            backAnimatedStyle,
            {
              backfaceVisibility: 'hidden',
              backgroundColor: getBackBg(),
              borderRadius: 8,
            },
          ]}
          className="absolute w-full h-full justify-center items-center"
        >
          <Text
            className="text-2xl font-display"
            style={{ color: colors.p1 }}
          >
            ?
          </Text>
        </AnimatedView>

        {/* Front side */}
        <AnimatedView
          style={[
            frontAnimatedStyle,
            {
              backfaceVisibility: 'hidden',
              backgroundColor: getFrontBg(),
              borderRadius: 8,
              // Ghost border for matched cards
              borderWidth: matchedBy !== -1 ? 1.5 : 0,
              borderColor: matchedBy !== -1 ? getGhostBorder() : 'transparent',
            },
          ]}
          className="absolute w-full h-full justify-center items-center"
        >
          <Text style={{ fontSize: 28 }}>
            {emoji}
          </Text>
        </AnimatedView>
      </View>
    </Pressable>
  );
}
