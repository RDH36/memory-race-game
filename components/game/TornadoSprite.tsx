import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const ELLIPSES = [
  { width: 18, height: 36, left: 0, opacity: 0.5, delay: 0 },
  { width: 24, height: 52, left: 28, opacity: 0.7, delay: 60 },
  { width: 28, height: 60, left: 60, opacity: 0.85, delay: 120 },
  { width: 24, height: 52, left: 96, opacity: 0.7, delay: 180 },
  { width: 18, height: 36, left: 124, opacity: 0.5, delay: 240 },
];

const SPRITE_WIDTH = 152;
const SPRITE_HEIGHT = 60;

function Ellipse({
  width,
  height,
  left,
  opacity,
  delay,
}: (typeof ELLIPSES)[number]) {
  const rotateZ = useSharedValue(0);
  const scaleY = useSharedValue(1);

  useEffect(() => {
    rotateZ.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(12, { duration: 300, easing: Easing.inOut(Easing.ease) }),
          withTiming(-12, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
    scaleY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.15, { duration: 250 }),
          withTiming(0.85, { duration: 250 }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { rotateZ: `${rotateZ.value}deg` },
      { scaleY: scaleY.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          position: 'absolute',
          left,
          width,
          height,
          borderRadius: width / 2,
          backgroundColor: '#534AB7',
          opacity,
          top: (SPRITE_HEIGHT - height) / 2,
        },
      ]}
    />
  );
}

export function TornadoSprite() {
  const lineOpacity = useSharedValue(0.6);

  useEffect(() => {
    lineOpacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 200 }),
        withTiming(0.5, { duration: 200 }),
      ),
      -1,
      true,
    );
  }, []);

  const lineStyle = useAnimatedStyle(() => ({
    opacity: lineOpacity.value,
  }));

  return (
    <View style={{ width: SPRITE_WIDTH, height: SPRITE_HEIGHT, alignItems: 'center' }}>
      {/* Horizontal line */}
      <Animated.View
        style={[
          lineStyle,
          {
            position: 'absolute',
            width: SPRITE_WIDTH,
            height: 3,
            backgroundColor: '#534AB7',
            borderRadius: 1.5,
            top: SPRITE_HEIGHT / 2 - 1.5,
          },
        ]}
      />
      {/* Ellipses */}
      {ELLIPSES.map((e, i) => (
        <Ellipse key={i} {...e} />
      ))}
    </View>
  );
}
