import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { Card } from "../ui/Card";
import { useTheme } from "../../lib/ThemeContext";

interface XpRewardBarProps {
  xpGained: number;
  level: number;
  levelProgress: number;
  xpInLevel: number;
  xpForNextLevel: number;
  won: boolean;
  /** When true, show a Premium boost badge ("+10% Premium") next to the XP value. */
  premiumBoosted?: boolean;
}

export function XpRewardBar({
  xpGained,
  level,
  levelProgress,
  xpInLevel,
  xpForNextLevel,
  won,
  premiumBoosted,
}: XpRewardBarProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const barWidth = useSharedValue(0);
  const xpScale = useSharedValue(0.6);
  const xpOpacity = useSharedValue(0);

  useEffect(() => {
    xpOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));
    xpScale.value = withDelay(200, withSpring(1, { damping: 8, stiffness: 150 }));
    barWidth.value = withDelay(
      500,
      withTiming(Math.min(levelProgress * 100, 100), {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [levelProgress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
    height: 8,
    backgroundColor: won ? colors.success : colors.primaryContainer,
    borderRadius: 4,
  }));

  const xpStyle = useAnimatedStyle(() => ({
    opacity: xpOpacity.value,
    transform: [{ scale: xpScale.value }],
  }));

  const xpColor = won ? colors.success : colors.primaryContainer;

  return (
    <Card style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 11, fontFamily: "Nunito_700Bold", color: colors.onSurfaceVariant, letterSpacing: 0.5 }}>
          {t("result.xpGained")}
        </Text>
        <Animated.View style={[xpStyle, { flexDirection: "row", alignItems: "center", gap: 8 }]}>
          {premiumBoosted && (
            <View
              style={{
                flexDirection: "row", alignItems: "center", gap: 4,
                backgroundColor: "#F4DA8A20",
                borderColor: "#F4DA8A", borderWidth: 1,
                paddingHorizontal: 7, paddingVertical: 3,
                borderRadius: 999,
              }}
            >
              <Text style={{ fontSize: 11 }}>👑</Text>
              <Text style={{ fontSize: 10, fontFamily: "Nunito_700Bold", color: "#8B6914", letterSpacing: 0.3 }}>
                {t("result.premiumBoost", "+10% Premium")}
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 20, fontFamily: "Fredoka_700Bold", color: xpColor }}>
            +{xpGained} XP
          </Text>
        </Animated.View>
      </View>

      <View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
          <Text style={{ fontSize: 11, fontFamily: "Nunito_700Bold", color: colors.onSurface }}>
            Nv. {level}
          </Text>
          <Text style={{ fontSize: 10, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant }}>
            {xpInLevel} / {xpForNextLevel} XP → Nv. {level + 1}
          </Text>
        </View>
        <View style={{ height: 8, backgroundColor: isDark ? "#333" : "#E8E4E4", borderRadius: 4 }}>
          <Animated.View style={barStyle} />
        </View>
      </View>
    </Card>
  );
}
