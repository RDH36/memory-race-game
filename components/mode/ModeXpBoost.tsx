import { Pressable, Switch, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/ThemeContext";

interface ModeXpBoostProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

export function ModeXpBoost({ value, onChange }: ModeXpBoostProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Animated.View entering={FadeInDown.delay(400).duration(350)}>
      <Pressable
        onPress={() => onChange(!value)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          backgroundColor: value ? colors.warningBg : colors.surfaceContainer,
          borderRadius: 14,
          paddingVertical: 12,
          paddingHorizontal: 14,
        }}
      >
        <Text style={{ fontSize: 22 }}>🎬</Text>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 13, fontFamily: "Fredoka_600SemiBold", color: colors.onSurface }}
          >
            {t("home.xpBoost")}
          </Text>
          <Text
            style={{
              fontSize: 10,
              fontFamily: "Nunito_400Regular",
              color: colors.onSurfaceMuted,
              marginTop: 1,
            }}
          >
            {t("home.xpBoostDesc")}
          </Text>
        </View>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: colors.surfaceContainerLow, true: colors.warning + "80" }}
          thumbColor={value ? colors.warning : "#FFFFFF"}
        />
      </Pressable>
    </Animated.View>
  );
}
