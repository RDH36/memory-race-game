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
import { ROYAL_THEME, INFERNO_THEME, HEAVEN_THEME, type CardSkin } from '../../lib/skins';
import { RoyalCardVisual } from './royal/RoyalCardVisual';
import { InfernoCardVisual } from './inferno/InfernoCardVisual';
import { HeavenCardVisual } from './heaven/HeavenCardVisual';

export type { CardSkin };

interface CardItemProps {
  cardId: number;
  emoji: string;
  isFaceUp: boolean;
  matchedBy: number;
  isJustMatched: boolean;
  isJustMismatched: boolean;
  onPress: (cardId: number) => void;
  disabled: boolean;
  skin?: CardSkin;
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
  skin = 'classic',
}: CardItemProps) {
  const rotateY = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const shakeX = useSharedValue(0);
  const flashOpacity = useSharedValue(0);
  const flashScale = useSharedValue(0.8);

  useEffect(() => {
    rotateY.value = withTiming(isFaceUp ? 180 : 0, { duration: 320 });
  }, [isFaceUp, rotateY]);

  useEffect(() => {
    if (isJustMatched) {
      cardScale.value = withSequence(
        withSpring(1.12, { damping: 6, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 200 }),
      );
      if (skin === 'royal' || skin === 'inferno' || skin === 'heaven') {
        flashOpacity.value = withSequence(
          withTiming(1, { duration: 150 }),
          withTiming(0, { duration: 450 }),
        );
        flashScale.value = withSequence(
          withTiming(1.15, { duration: 200 }),
          withTiming(1.35, { duration: 400 }),
        );
      }
    }
  }, [isJustMatched, cardScale, flashOpacity, flashScale, skin]);

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

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
    transform: [{ scale: flashScale.value }],
  }));

  const { colors } = useTheme();

  // --- Heaven skin ---
  if (skin === 'heaven') {
    const player = matchedBy === 1 || matchedBy === 2 ? (matchedBy as 1 | 2) : 1;
    const frontState = matchedBy !== -1 ? 'matched' : 'face';
    return (
      <Pressable
        onPress={() => onPress(cardId)}
        disabled={disabled}
        className="aspect-square flex-1"
        style={{ borderRadius: 12 }}
      >
        <View className="relative w-full h-full">
          <AnimatedView
            style={[backAnimatedStyle, { backfaceVisibility: 'hidden' }]}
            className="absolute w-full h-full"
          >
            <HeavenCardVisual state="back" fillParent />
          </AnimatedView>
          <AnimatedView
            style={[frontAnimatedStyle, { backfaceVisibility: 'hidden' }]}
            className="absolute w-full h-full"
          >
            <HeavenCardVisual state={frontState} emoji={emoji} player={player} fillParent />
            <AnimatedView
              pointerEvents="none"
              style={[
                flashStyle,
                {
                  position: 'absolute',
                  top: '15%', left: '15%', right: '15%', bottom: '15%',
                  borderRadius: 999,
                  backgroundColor: HEAVEN_THEME.haloBright,
                  opacity: 0,
                },
              ]}
            />
          </AnimatedView>
        </View>
      </Pressable>
    );
  }

  // --- Inferno skin ---
  if (skin === 'inferno') {
    const player = matchedBy === 1 || matchedBy === 2 ? (matchedBy as 1 | 2) : 1;
    const frontState = matchedBy !== -1 ? 'matched' : 'face';
    // Deterministic chaos rotation per card (~ ±1.5°) — visual identity of Inferno
    const chaosRot = Math.round(Math.sin(cardId * 7.13) * 15) / 10;
    return (
      <Pressable
        onPress={() => onPress(cardId)}
        disabled={disabled}
        className="aspect-square flex-1"
        style={{ borderRadius: 4, transform: [{ rotate: `${chaosRot}deg` }] }}
      >
        <View className="relative w-full h-full">
          <AnimatedView
            style={[backAnimatedStyle, { backfaceVisibility: 'hidden' }]}
            className="absolute w-full h-full"
          >
            <InfernoCardVisual state="back" fillParent />
          </AnimatedView>
          <AnimatedView
            style={[frontAnimatedStyle, { backfaceVisibility: 'hidden' }]}
            className="absolute w-full h-full"
          >
            <InfernoCardVisual state={frontState} emoji={emoji} player={player} fillParent />
            {/* Ember match flash overlay */}
            <AnimatedView
              pointerEvents="none"
              style={[
                flashStyle,
                {
                  position: 'absolute',
                  top: '15%', left: '15%', right: '15%', bottom: '15%',
                  borderRadius: 999,
                  backgroundColor: INFERNO_THEME.emberBright,
                  opacity: 0,
                },
              ]}
            />
          </AnimatedView>
        </View>
      </Pressable>
    );
  }

  // --- Royal skin ---
  if (skin === 'royal') {
    const player = matchedBy === 1 || matchedBy === 2 ? (matchedBy as 1 | 2) : 1;
    const frontState = matchedBy !== -1 ? 'matched' : 'face';
    return (
      <Pressable
        onPress={() => onPress(cardId)}
        disabled={disabled}
        className="aspect-square flex-1"
        style={{ borderRadius: 8 }}
      >
        <View className="relative w-full h-full">
          <AnimatedView
            style={[backAnimatedStyle, { backfaceVisibility: 'hidden' }]}
            className="absolute w-full h-full"
          >
            <RoyalCardVisual state="back" fillParent />
          </AnimatedView>
          <AnimatedView
            style={[frontAnimatedStyle, { backfaceVisibility: 'hidden' }]}
            className="absolute w-full h-full"
          >
            <RoyalCardVisual state={frontState} emoji={emoji} player={player} fillParent />
            {/* Gold match flash overlay */}
            <AnimatedView
              pointerEvents="none"
              style={[
                flashStyle,
                {
                  position: 'absolute',
                  top: '15%', left: '15%', right: '15%', bottom: '15%',
                  borderRadius: 999,
                  backgroundColor: ROYAL_THEME.goldBright,
                  opacity: 0,
                },
              ]}
            />
          </AnimatedView>
        </View>
      </Pressable>
    );
  }

  // --- Classic skin (existing) ---
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
          <Text className="text-2xl font-display" style={{ color: colors.p1 }}>
            ?
          </Text>
        </AnimatedView>

        <AnimatedView
          style={[
            frontAnimatedStyle,
            {
              backfaceVisibility: 'hidden',
              backgroundColor: getFrontBg(),
              borderRadius: 8,
              borderWidth: matchedBy !== -1 ? 1.5 : 0,
              borderColor: matchedBy !== -1 ? getGhostBorder() : 'transparent',
            },
          ]}
          className="absolute w-full h-full justify-center items-center"
        >
          <Text style={{ fontSize: 28 }}>{emoji}</Text>
        </AnimatedView>
      </View>
    </Pressable>
  );
}
