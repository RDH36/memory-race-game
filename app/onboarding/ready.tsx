import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";
import { Btn3D, Mascot, Panel } from "@/components/ui/arcade";

export default function ReadyScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const handlePlay = async () => {
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
                backgroundColor: i === 4 ? colors.primaryContainer : colors.primaryContainerBg,
              }}
            />
          ))}
        </Animated.View>

        {/* Title + mascot */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={{ marginTop: 28, alignItems: "center" }}
        >
          <Mascot emoji="🦊" size={90} />
          <Text
            style={{
              fontSize: 32,
              fontFamily: "Fredoka_700Bold",
              color: colors.onSurface,
              textAlign: "center",
              marginTop: 8,
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
              color: colors.hues.green[0],
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
            <Panel
              radius={16}
              style={{ paddingHorizontal: 16, paddingVertical: 10, alignItems: "center" }}
            >
              <Text style={{ fontSize: 11, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant }}>
                {t("home.difficulty.easy")}
              </Text>
              <Text style={{ fontSize: 18, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
                🐣
              </Text>
            </Panel>
            <Panel
              radius={16}
              style={{ paddingHorizontal: 16, paddingVertical: 10, alignItems: "center" }}
            >
              <Text style={{ fontSize: 11, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant }}>
                {t("game.pairs")}
              </Text>
              <Text style={{ fontSize: 18, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
                8
              </Text>
            </Panel>
            <Panel
              radius={16}
              style={{ paddingHorizontal: 16, paddingVertical: 10, alignItems: "center" }}
            >
              <Text style={{ fontSize: 11, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant }}>
                {t("tornado.default")}
              </Text>
              <Text style={{ fontSize: 18, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
                🌪️
              </Text>
            </Panel>
          </Animated.View>
        </View>

        {/* CTA */}
        <Animated.View entering={FadeInDown.delay(900).duration(500)} style={{ paddingBottom: 24 }}>
          <Btn3D
            color="gold"
            size="lg"
            full
            haptic="press"
            label={t("onboarding.ready.cta")}
            onPress={handlePlay}
          >
            <Text style={{ fontSize: 18 }}>▶</Text>
          </Btn3D>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
