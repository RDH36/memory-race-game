import { useEffect } from 'react';
import { Dimensions, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { TornadoSprite } from './TornadoSprite';

interface TornadoOverlayProps {
  onComplete: () => void;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function TornadoOverlay({ onComplete }: TornadoOverlayProps) {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const warningScale = useSharedValue(1);
  const warningOpacity = useSharedValue(1);
  const tornadoTranslateY = useSharedValue(-200);
  const tornadoOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);

  const warningScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: warningScale.value }],
    opacity: warningOpacity.value,
  }));

  const tornadoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: tornadoTranslateY.value }],
    opacity: tornadoOpacity.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  useEffect(() => {
    // Phase 1: Warning banner (0-800ms)
    warningScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 400 }),
        withTiming(1, { duration: 400 }),
      ),
      1,
      false,
    );

    // Phase 2 (800ms): tornado slides top → bottom
    const phase2Timer = setTimeout(() => {
      warningOpacity.value = withTiming(0, { duration: 200 });
      tornadoOpacity.value = withTiming(1, { duration: 150 });
      subtitleOpacity.value = withTiming(0.8, { duration: 300 });
      tornadoTranslateY.value = withTiming(screenHeight + 200, {
        duration: 8000,
        easing: Easing.linear,
      });
    }, 800);

    // Phase 3: fade out
    const phase3Timer = setTimeout(() => {
      tornadoOpacity.value = withTiming(0, { duration: 300 });
      subtitleOpacity.value = withTiming(0, { duration: 200 });
    }, 8800);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 9100);

    return () => {
      clearTimeout(phase2Timer);
      clearTimeout(phase3Timer);
      clearTimeout(completeTimer);
    };
  }, []);

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: screenWidth,
        height: screenHeight,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Warning Banner */}
      <AnimatedView
        style={[
          warningScaleStyle,
          {
            position: 'absolute',
            backgroundColor: '#534AB7',
            paddingHorizontal: 32,
            paddingVertical: 16,
            borderRadius: 16,
            zIndex: 10,
            shadowColor: '#1A1C17',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          },
        ]}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 24, fontFamily: 'Fredoka_700Bold' }}>
          ⚠️ Tornade !
        </Text>
      </AnimatedView>

      {/* Tornado Sprite */}
      <AnimatedView
        style={[
          tornadoStyle,
          {
            position: 'absolute',
            left: screenWidth / 2 - 76,
            alignItems: 'center',
          },
        ]}
      >
        <TornadoSprite />
      </AnimatedView>

      {/* Subtitle */}
      <AnimatedView
        style={[
          subtitleStyle,
          {
            position: 'absolute',
            bottom: screenHeight * 0.15,
            backgroundColor: 'rgba(83, 74, 183, 0.85)',
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderRadius: 12,
          },
        ]}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'Nunito_600SemiBold' }}>
          Les cartes se mélangent...
        </Text>
      </AnimatedView>
    </View>
  );
}
