import { ActivityIndicator, Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { IconBox } from "../ui/IconBox";
import { useTheme } from "../../lib/ThemeContext";

interface ModeCardProps {
  icon: string;
  title: string;
  desc: string;
  badge: string;
  badgeColor: string;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}

export function ModeCard({
  icon,
  title,
  desc,
  badge,
  badgeColor,
  disabled,
  loading,
  onPress,
}: ModeCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      disabled={disabled || loading}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.97 : 1 }],
        opacity: disabled ? 0.45 : 1,
      })}
    >
      <Card style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <IconBox emoji={icon} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text
              style={{ fontSize: 16, fontFamily: "Fredoka_600SemiBold", color: colors.onSurface }}
            >
              {title}
            </Text>
            {disabled && (
              <View
                style={{
                  backgroundColor: colors.onSurfaceVariant,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
              >
                <Text style={{ fontSize: 9, fontFamily: "Nunito_700Bold", color: "#fff", letterSpacing: 0.3 }}>
                  {t("settings.comingSoon").toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Nunito_400Regular",
              color: colors.onSurfaceVariant,
              marginTop: 2,
              lineHeight: 16,
            }}
          >
            {desc}
          </Text>
          <Badge text={badge} color={badgeColor} style={{ marginTop: 8 }} />
        </View>
        {loading && (
          <ActivityIndicator size="small" color={colors.primaryContainer} />
        )}
      </Card>
    </Pressable>
  );
}
