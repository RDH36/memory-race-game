import { useEffect } from 'react';
import { Dimensions, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  runOnJS,
} from 'react-native-reanimated';

interface TornadoOverlayProps {
  onComplete: () => void;
}

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

export function TornadoOverlay({ onComplete }: TornadoOverlayProps) {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const warningScale = useSharedValue(1);
  const warningOpacity = useSharedValue(1);
  const tornadoTranslateX = useSharedValue(-screenWidth);
  const tornadoOpacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(0.4);

  const warningScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: warningScale.value }],
    opacity: warningOpacity.value,
  }));

  const tornadoStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tornadoTranslateX.value }],
    opacity: tornadoOpacity.value,
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  useEffect(() => {
    // Phase 1: Warning banner with pulsing animation (0-800ms)
    warningScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 400 }),
        withTiming(1, { duration: 400 })
      ),
      1,
      false
    );

    // Phase 2 starts at 800ms: fade out warning and show tornado
    const phase2Timer = setTimeout(() => {
      warningOpacity.value = withTiming(0, { duration: 200 });
      tornadoOpacity.value = withTiming(1, { duration: 200 });
      tornadoTranslateX.value = withTiming(screenWidth + 100, {
        duration: 1200,
      });
    }, 800);

    // Phase 3 starts at 2000ms: fade everything out
    const phase3Timer = setTimeout(() => {
      overlayOpacity.value = withTiming(0, { duration: 300 });
      tornadoOpacity.value = withTiming(0, { duration: 300 });
    }, 2000);

    // Call onComplete at 2300ms
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2300);

    return () => {
      clearTimeout(phase2Timer);
      clearTimeout(phase3Timer);
      clearTimeout(completeTimer);
    };
  }, [
    warningScale,
    warningOpacity,
    tornadoTranslateX,
    tornadoOpacity,
    overlayOpacity,
    onComplete,
    screenWidth,
  ]);

  return (
    <AnimatedView
      style={[
        overlayStyle,
        {
          position: 'absolute',
          top: 0,
          left: 0,
          width: screenWidth,
          height: screenHeight,
          backgroundColor: '#000000',
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}
    >
      {/* Warning Banner - Phase 1 */}
      <AnimatedView
        style={[
          warningScaleStyle,
          {
            position: 'absolute',
            backgroundColor: '#534AB7',
            paddingHorizontal: 32,
            paddingVertical: 16,
            borderRadius: 16,
          },
        ]}
      >
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 24,
            fontWeight: '700',
          }}
        >
          ⚠️ Tornade !
        </Text>
      </AnimatedView>

      {/* Tornado with text - Phase 2 */}
      <AnimatedView
        style={[
          tornadoStyle,
          {
            position: 'absolute',
            alignItems: 'center',
            gap: 16,
          },
        ]}
      >
        <Text
          style={{
            fontSize: 56,
          }}
        >
          🌪️
        </Text>
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: '500',
            position: 'absolute',
            bottom: -30,
          }}
        >
          Les cartes se mélangent...
        </Text>
      </AnimatedView>
    </AnimatedView>
  );
}
