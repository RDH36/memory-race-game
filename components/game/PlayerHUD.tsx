import { Text, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';

interface OpponentCardProps {
  name: string;
  subtitle: string;
  avatar: string;
  pairsMatched: number;
  totalPairs: number;
  isActive: boolean;
  timerSeconds: number;
  hideTimer?: boolean;
}

function ProgressDots({ filled, total }: { filled: number; total: number }) {
  const { colors, isDark } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i < filled ? colors.primaryContainer : isDark ? '#333' : '#E8E4E4',
          }}
        />
      ))}
    </View>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function OpponentCard({
  name,
  subtitle,
  avatar,
  pairsMatched,
  totalPairs,
  isActive,
  timerSeconds,
  hideTimer,
}: OpponentCardProps) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.surfaceContainer,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Timer */}
      {!hideTimer && (
        <View
          style={{
            backgroundColor: isActive ? colors.primaryContainerBg : isDark ? '#2A2A2A' : '#F5F2F2',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'Fredoka_600SemiBold',
              color: isActive ? colors.primaryContainer : colors.onSurfaceVariant,
            }}
          >
            {formatTime(timerSeconds)}
          </Text>
        </View>
      )}

      {/* Dots */}
      <ProgressDots filled={pairsMatched} total={totalPairs} />

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Name + ELO */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 14, fontFamily: 'Fredoka_600SemiBold', color: colors.onSurface }}>
          {name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
          {isActive && (
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: colors.success,
              }}
            />
          )}
          <Text style={{ fontSize: 11, fontFamily: 'Nunito_400Regular', color: colors.onSurfaceVariant }}>
            {subtitle}
          </Text>
        </View>
      </View>

      {/* Avatar */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: colors.p2Bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 22 }}>{avatar}</Text>
      </View>
    </View>
  );
}

export { ProgressDots, formatTime };
