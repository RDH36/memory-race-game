import { Pressable, Text, View } from 'react-native';
import { useCallback, useState } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface ActionBarProps {
  canUseTornado: boolean;
  onTornado: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ActionBar({ canUseTornado, onTornado }: ActionBarProps) {
  const scale = useSharedValue(1);
  const [isPressed, setIsPressed] = useState(false);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (canUseTornado) {
      setIsPressed(true);
      scale.value = withTiming(0.95, { duration: 100 });
    }
  }, [canUseTornado, scale]);

  const handlePressOut = useCallback(() => {
    setIsPressed(false);
    scale.value = withTiming(1, { duration: 100 });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (canUseTornado) {
      onTornado();
    }
  }, [canUseTornado, onTornado]);

  return (
    <View className="px-4 py-4 items-center justify-center">
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!canUseTornado}
        style={[scaleStyle]}
        className={
          canUseTornado
            ? 'bg-[#534AB7] rounded-xl px-6 py-3'
            : 'bg-gray-300 rounded-xl px-6 py-3'
        }
      >
        <Text
          className="font-medium text-base"
          style={{
            color: canUseTornado ? '#FFFFFF' : '#9CA3AF',
            opacity: canUseTornado ? 1 : 0.4,
          }}
        >
          🌪️ Lancer tornade
        </Text>
      </AnimatedPressable>
    </View>
  );
}
