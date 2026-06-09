import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../lib/ThemeContext';
import { Btn3D, Panel } from '@/components/ui/arcade';

interface ActionBarProps {
  emoji: string;
  name: string;
  usesLeft: number;
  canUse: boolean;
  onPress: () => void;
  shieldCharges?: number;
  freezeTurns?: number;
}

export function ActionBar({
  emoji,
  name,
  usesLeft,
  canUse,
  onPress,
  shieldCharges = 0,
  freezeTurns = 0,
}: ActionBarProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const exhausted = usesLeft <= 0 && shieldCharges <= 0 && freezeTurns <= 0;

  const subtitle =
    shieldCharges > 0
      ? t('power.shield', { n: shieldCharges })
      : freezeTurns > 0
        ? t('power.frozen', { n: freezeTurns })
        : usesLeft <= 0
          ? t('power.exhaustedSub')
          : canUse
            ? t('power.readySub')
            : t('power.waitSub');

  return (
    <Panel
      style={{
        paddingVertical: 8,
        paddingLeft: 12,
        paddingRight: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        opacity: exhausted ? 0.5 : 1,
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text
            style={{
              fontSize: 13,
              fontFamily: 'Fredoka_700Bold',
              color: canUse ? colors.onSurface : colors.onSurfaceVariant,
            }}
          >
            {emoji} {name}
          </Text>
          {usesLeft > 1 && (
            <View
              style={{
                borderRadius: 999,
                paddingHorizontal: 7,
                paddingVertical: 1,
                backgroundColor: colors.hues.gold[2],
              }}
            >
              <Text style={{ fontSize: 10.5, fontFamily: 'Fredoka_700Bold', color: colors.hues.gold[1] }}>
                ×{usesLeft}
              </Text>
            </View>
          )}
        </View>
        <Text style={{ fontSize: 11, fontFamily: 'Fredoka_700Bold', color: colors.onSurfaceMuted, marginTop: 2 }}>
          {subtitle}
        </Text>
      </View>

      {usesLeft > 0 && (
        <Btn3D
          color="violet"
          size="sm"
          haptic="press"
          disabled={!canUse}
          label={t('power.launch')}
          onPress={onPress}
        >
          <Text style={{ fontSize: 15 }}>{emoji}</Text>
        </Btn3D>
      )}
    </Panel>
  );
}
