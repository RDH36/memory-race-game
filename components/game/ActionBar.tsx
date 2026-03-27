import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../lib/ThemeContext';

interface ActionBarProps {
  canUseTornado: boolean;
  tornadoUsed: boolean;
  onTornado: () => void;
}

export function ActionBar({ canUseTornado, tornadoUsed, onTornado }: ActionBarProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

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
    <View
      style={{
        backgroundColor: colors.surfaceContainer,
        borderRadius: 16,
        paddingVertical: 12,
        paddingLeft: 16,
        paddingRight: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        opacity: tornadoUsed ? 0.5 : 1,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.04,
        shadowRadius: 20,
        elevation: 2,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'Fredoka_600SemiBold',
            color: canUseTornado ? colors.onSurface : colors.onSurfaceVariant,
          }}
        >
          {title}
        </Text>
        <Text style={{ fontSize: 11, fontFamily: 'Nunito_400Regular', color: colors.onSurfaceVariant, marginTop: 2 }}>
          {subtitle}
        </Text>
      </View>

      {!tornadoUsed && (
        <View
          style={{
            backgroundColor: canUseTornado ? colors.primaryContainer : isDark ? '#333' : '#D5D1D1',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <Pressable
            onPress={onTornado}
            disabled={!canUseTornado}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            style={{ paddingHorizontal: 24, paddingVertical: 14 }}
          >
            <Text
              style={{
                color: canUseTornado ? '#FFFFFF' : colors.onSurfaceVariant,
                fontSize: 15,
                fontFamily: 'Nunito_700Bold',
              }}
            >
              🌪️ {t('tornado.launch')}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
