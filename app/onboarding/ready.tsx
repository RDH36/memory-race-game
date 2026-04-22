import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";

const OPPONENTS = [
  { key: "babyBot", emoji: "🐣", color: "#1D9E75" },
] as const;

export default function ReadyScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const handlePlay = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await AsyncStorage.setItem("onboarding_complete", "true");
    router.push("/onboarding/battle");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {/* Progress dots */}
        <Animated.View
          entering={FadeIn.delay(100).duration(400)}
          style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 16 }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={{
                width: i === 4 ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.primaryContainer,
              }}
            />
          ))}
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ marginTop: 40 }}>
          <Text
            style={{
              fontSize: 32,
              fontFamily: "Fredoka_700Bold",
              color: colors.primaryContainer,
              textAlign: "center",
            }}
          >
            {t("onboarding.ready.title")}
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontFamily: "Nunito_400Regular",
              color: colors.onSurfaceVariant,
              textAlign: "center",
              marginTop: 8,
            }}
          >
            {t("onboarding.ready.subtitle")}
          </Text>
        </Animated.View>

        {/* Boss */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Animated.Text
            entering={FadeInDown.delay(400).duration(500)}
            style={{ fontSize: 80 }}
          >
            🐣
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(550).duration(400)}
            style={{
              fontSize: 26,
              fontFamily: "Fredoka_700Bold",
              color: "#1D9E75",
              marginTop: 12,
            }}
          >
            {t("onboarding.ready.babyBot")}
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(650).duration(400)}
            style={{
              fontSize: 14,
              fontFamily: "Nunito_400Regular",
              color: colors.onSurfaceVariant,
              marginTop: 4,
            }}
          >
            {t("onboarding.ready.babyBotDesc")}
          </Animated.Text>

          <Animated.View
            entering={FadeInDown.delay(800).duration(400)}
            style={{ flexDirection: "row", gap: 16, marginTop: 28 }}
          >
            <View
              style={{
                backgroundColor: colors.primaryContainerBg,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 11, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant }}>
                {t("home.difficulty.easy")}
              </Text>
              <Text style={{ fontSize: 18, fontFamily: "Fredoka_700Bold", color: colors.primaryContainer }}>
                🐣
              </Text>
            </View>
            <View
              style={{
                backgroundColor: colors.primaryContainerBg,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 11, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant }}>
                {t("game.pairs")}
              </Text>
              <Text style={{ fontSize: 18, fontFamily: "Fredoka_700Bold", color: colors.primaryContainer }}>
                8
              </Text>
            </View>
            <View
              style={{
                backgroundColor: colors.primaryContainerBg,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 11, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant }}>
                {t("tornado.default")}
              </Text>
              <Text style={{ fontSize: 18, fontFamily: "Fredoka_700Bold", color: colors.primaryContainer }}>
                🌪️
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* CTA */}
        <Animated.View entering={FadeInDown.delay(900).duration(500)} style={{ paddingBottom: 24 }}>
          <Pressable
            onPress={handlePlay}
            style={{
              backgroundColor: colors.primaryContainer,
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, fontFamily: "Fredoka_700Bold", color: "#FFFFFF" }}>
              {t("onboarding.ready.cta")} →
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
