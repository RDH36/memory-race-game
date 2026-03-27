import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface PlayerHUDProps {
  scores: { p1: number; p2: number };
  tornadoUsed: { p1: boolean; p2: boolean };
  currentTurn: 1 | 2;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function PlayerHUD({
  scores,
  tornadoUsed,
  currentTurn,
}: PlayerHUDProps) {
  const p1PulseOpacity = useSharedValue(1);
  const p2PulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (currentTurn === 1) {
      p1PulseOpacity.value = withRepeat(
        withTiming(0.5, { duration: 500 }),
        -1,
        true
      );
      p2PulseOpacity.value = 1;
    } else {
      p2PulseOpacity.value = withRepeat(
        withTiming(0.5, { duration: 500 }),
        -1,
        true
      );
      p1PulseOpacity.value = 1;
    }
  }, [currentTurn, p1PulseOpacity, p2PulseOpacity]);

  const p1PulseStyle = useAnimatedStyle(() => ({
    opacity: p1PulseOpacity.value,
  }));

  const p2PulseStyle = useAnimatedStyle(() => ({
    opacity: p2PulseOpacity.value,
  }));

  return (
    <View className="bg-white rounded-xl shadow-md px-4 py-4">
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Player 1 */}
        <View
          className={
            currentTurn === 1
              ? 'flex-1 bg-[#E6F1FB] rounded-lg px-4 py-3 border-l-4'
              : 'flex-1 bg-white rounded-lg px-4 py-3'
          }
          style={
            currentTurn === 1
              ? { borderLeftColor: '#378ADD' }
              : undefined
          }
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Text className="font-medium text-sm" style={{ color: '#378ADD' }}>
              Joueur
            </Text>
            {currentTurn === 1 && (
              <AnimatedView
                style={[
                  p1PulseStyle,
                  {
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#1D9E75',
                  },
                ]}
              />
            )}
          </View>
          <Text className="font-medium text-3xl mb-3" style={{ color: '#378ADD' }}>
            {scores.p1}
          </Text>
          <Text style={{ color: tornadoUsed.p1 ? '#D0D0C8' : '#000' }}>
            🌪️
          </Text>
        </View>

        {/* VS */}
        <View className="items-center justify-center">
          <Text className="font-bold text-lg" style={{ color: '#999999' }}>
            VS
          </Text>
        </View>

        {/* Player 2 */}
        <View
          className={
            currentTurn === 2
              ? 'flex-1 bg-[#FAECE7] rounded-lg px-4 py-3 border-r-4'
              : 'flex-1 bg-white rounded-lg px-4 py-3'
          }
          style={
            currentTurn === 2
              ? { borderRightColor: '#D85A30' }
              : undefined
          }
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
              justifyContent: 'flex-end',
            }}
          >
            <Text className="font-medium text-sm" style={{ color: '#D85A30' }}>
              CPU
            </Text>
            {currentTurn === 2 && (
              <AnimatedView
                style={[
                  p2PulseStyle,
                  {
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#1D9E75',
                  },
                ]}
              />
            )}
          </View>
          <Text
            className="font-medium text-3xl mb-3 text-right"
            style={{ color: '#D85A30' }}
          >
            {scores.p2}
          </Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: tornadoUsed.p2 ? '#D0D0C8' : '#000' }}>
              🌪️
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
