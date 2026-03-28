import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";

export default function ResultScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ p1?: string; p2?: string }>();

  const p1 = Number(params.p1 ?? 0);
  const p2 = Number(params.p2 ?? 0);
  const result = p1 > p2 ? "won" : p1 < p2 ? "lost" : "draw";

  const titleColor =
    result === "won" ? colors.success : result === "lost" ? colors.error : colors.primaryContainer;
  const ctaKey = `onboarding.result.cta${result.charAt(0).toUpperCase() + result.slice(1)}`;

  const handleCta = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await AsyncStorage.setItem("onboarding_complete", "true");
    router.replace("/auth");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {/* Result */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={{ fontSize: 64, marginBottom: 16 }}>
            {result === "won" ? "🏆" : result === "lost" ? "😤" : "🤝"}
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(400).duration(500)}
            style={{ fontSize: 34, fontFamily: "Fredoka_700Bold", color: titleColor, textAlign: "center" }}
          >
            {t(`onboarding.result.${result}`)}
          </Animated.Text>

          {/* Score */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(500)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              marginTop: 20,
              backgroundColor: colors.surfaceContainer,
              borderRadius: 16,
              paddingHorizontal: 24,
              paddingVertical: 14,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 12, fontFamily: "Nunito_600SemiBold", color: colors.p1 }}>
                {t("onboarding.result.you")}
              </Text>
              <Text style={{ fontSize: 28, fontFamily: "Fredoka_700Bold", color: colors.p1 }}>
                {p1}
              </Text>
            </View>
            <Text style={{ fontSize: 18, fontFamily: "Fredoka_600SemiBold", color: colors.onSurfaceVariant }}>
              —
            </Text>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 12, fontFamily: "Nunito_600SemiBold", color: colors.p2 }}>
                🐣 BabyBot
              </Text>
              <Text style={{ fontSize: 28, fontFamily: "Fredoka_700Bold", color: colors.p2 }}>
                {p2}
              </Text>
            </View>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(800).duration(500)}
            style={{
              fontSize: 15,
              fontFamily: "Nunito_400Regular",
              color: colors.onSurfaceVariant,
              textAlign: "center",
              marginTop: 16,
            }}
          >
            {t(`onboarding.result.${result}Sub`)}
          </Animated.Text>
        </View>

        {/* CTA → Login */}
        <Animated.View entering={FadeInDown.delay(1000).duration(500)} style={{ paddingBottom: 24 }}>
          <Pressable
            onPress={handleCta}
            style={{
              backgroundColor: colors.primaryContainer,
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: "center",
              shadowColor: colors.primaryContainer,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 4,
            }}
          >
            <Text style={{ fontSize: 18, fontFamily: "Fredoka_700Bold", color: "#FFFFFF" }}>
              {t(ctaKey)} →
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
