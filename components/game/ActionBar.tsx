import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../lib/ThemeContext';
import { Btn3D, Panel } from '@/components/ui/arcade';

interface ActionBarProps {
  canUseTornado: boolean;
  tornadoUsed: boolean;
  onTornado: () => void;
}

export function ActionBar({ canUseTornado, tornadoUsed, onTornado }: ActionBarProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const title = tornadoUsed
    ? `🌪️ ${t('tornado.used')}`
    : canUseTornado
      ? `🌪️ ${t('tornado.available')}`
      : `🌪️ ${t('tornado.default')}`;

  const subtitle = tornadoUsed
    ? t('tornado.usedSub')
    : canUseTornado
      ? t('tornado.availableSub')
      : t('tornado.waitSub');

  return (
    <Panel
      style={{
        paddingVertical: 8,
        paddingLeft: 12,
        paddingRight: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        opacity: tornadoUsed ? 0.5 : 1,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 13,
            fontFamily: 'Fredoka_700Bold',
            color: canUseTornado ? colors.onSurface : colors.onSurfaceVariant,
          }}
        >
          {title}
        </Text>
        <Text style={{ fontSize: 11, fontFamily: 'Fredoka_700Bold', color: colors.onSurfaceMuted, marginTop: 2 }}>
          {subtitle}
        </Text>
      </View>

      {!tornadoUsed && (
        <Btn3D
          color="violet"
          size="sm"
          haptic="press"
          disabled={!canUseTornado}
          label={t('tornado.launch')}
          onPress={onTornado}
        >
          <Text style={{ fontSize: 15 }}>🌪️</Text>
        </Btn3D>
      )}
    </Panel>
  );
}
