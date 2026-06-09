import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { Panel } from "@/components/ui/arcade";
import { useTheme } from "../../lib/ThemeContext";

interface CoinRewardBarProps {
  coinsGained: number;
  total: number;
  /** Show a Premium bonus badge ("+50 👑") next to the value. */
  premiumBonus?: boolean;
}

export function CoinRewardBar({ coinsGained, total, premiumBonus }: CoinRewardBarProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [, goldD] = colors.hues.gold;

  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(260, withTiming(1, { duration: 300 }));
    scale.value = withDelay(260, withSpring(1, { damping: 8, stiffness: 150 }));
  }, []);
  const valStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));

  return (
    <Panel style={{ padding: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: colors.hues.gold[2],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 18 }}>🪙</Text>
          </View>
          <View>
            <Text style={{ fontSize: 11, fontFamily: "Nunito_700Bold", color: colors.onSurfaceVariant, letterSpacing: 0.5 }}>
              {t("result.coinsGained")}
            </Text>
            <Text style={{ fontSize: 11.5, fontFamily: "Fredoka_700Bold", color: colors.onSurfaceMuted, marginTop: 1 }}>
              {t("result.coinsTotal", { total })}
            </Text>
          </View>
        </View>

        <Animated.View style={[valStyle, { flexDirection: "row", alignItems: "center", gap: 8 }]}>
          {premiumBonus && (
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
                {t("result.premiumCoins", "+50")}
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 22, fontFamily: "Fredoka_700Bold", color: goldD }}>+{coinsGained}</Text>
          <Text style={{ fontSize: 18 }}>🪙</Text>
        </Animated.View>
      </View>
    </Panel>
  );
}
