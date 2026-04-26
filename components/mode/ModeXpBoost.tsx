import { Pressable, Switch, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/ThemeContext";
import { usePremium } from "../../hooks/useEntitlements";

interface ModeXpBoostProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

export function ModeXpBoost({ value, onChange }: ModeXpBoostProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const premium = usePremium();

  // Premium users get a permanent +10% XP — no need for the rewarded ad toggle.
  if (premium) {
    return (
      <Animated.View entering={FadeInDown.delay(400).duration(350)}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            backgroundColor: "#F4DA8A20",
            borderColor: "#F4DA8A",
            borderWidth: 1.2,
            borderRadius: 14,
            paddingVertical: 12,
            paddingHorizontal: 14,
          }}
        >
          <Text style={{ fontSize: 22 }}>👑</Text>
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 13, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}
            >
              {t("mode.xpBoostPremium.title", "+10% XP · Premium actif")}
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Nunito_600SemiBold",
                color: colors.onSurfaceMuted,
                marginTop: 1,
              }}
            >
              {t("mode.xpBoostPremium.desc", "Bonus permanent appliqué automatiquement")}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "#F4DA8A",
              paddingHorizontal: 9,
              paddingVertical: 4,
              borderRadius: 999,
            }}
          >
            <Text style={{ fontSize: 10, fontFamily: "Nunito_700Bold", color: "#1A0509", letterSpacing: 0.4 }}>
              {t("mode.xpBoostPremium.badge", "ACTIF")}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }

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
