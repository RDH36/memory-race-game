import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../lib/ThemeContext';
import type { MatchResult } from '../../hooks/useLocalGame';

interface MatchFeedbackProps {
  result: MatchResult;
}

export function MatchFeedback({ result }: MatchFeedbackProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    if (!result) {
      opacity.value = 0;
      return;
    }

    opacity.value = withTiming(1, { duration: 150 });
    scale.value = withSpring(1, { damping: 8, stiffness: 200 });
    translateY.value = 0;

    // Fade out after a brief display
    opacity.value = withDelay(
      500,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) }),
    );
    translateY.value = withDelay(
      500,
      withTiming(-30, { duration: 400 }),
    );
  }, [result, opacity, translateY, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  if (!result) return null;

  const isMatch = result.type === 'match';
  const isP1 = result.player === 1;

  const text = isMatch
    ? isP1 ? `✨ ${t('feedback.playerMatch')}` : `🤖 ${t('feedback.cpuMatch')}`
    : isP1 ? `💨 ${t('feedback.playerMiss')}` : `🤖 ${t('feedback.cpuMiss')}`;

  const bgColor = isMatch
    ? isP1 ? colors.success : colors.p2
    : colors.onSurfaceVariant;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
      }}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            backgroundColor: bgColor,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 20,
          },
        ]}
      >
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 18,
            fontFamily: 'Fredoka_700Bold',
          }}
        >
          {text}
        </Text>
      </Animated.View>
    </View>
  );
}
