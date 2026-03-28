import { Pressable, Text } from "react-native";
import { Stack, useRouter, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/ThemeContext";

function SkipButton() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem("onboarding_complete", "true");
    router.replace("/auth");
  };

  return (
    <Pressable onPress={handleSkip} style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
      <Text
        style={{
          fontSize: 14,
          fontFamily: "Nunito_600SemiBold",
          color: colors.onSurfaceVariant,
        }}
      >
        {t("onboarding.skip")}
      </Text>
    </Pressable>
  );
}

const HIDE_SKIP_SCREENS = ["/onboarding/battle", "/onboarding/result"];

export default function OnboardingLayout() {
  const { colors } = useTheme();
  const pathname = usePathname();
  const showSkip = !HIDE_SKIP_SCREENS.includes(pathname);

  return (
    <Stack
      screenOptions={{
        headerShown: showSkip,
        headerTransparent: true,
        headerTitle: "",
        headerLeft: () => null,
        headerRight: () => <SkipButton />,
        gestureEnabled: false,
        contentStyle: { backgroundColor: colors.surface },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="battle" options={{ headerShown: false }} />
      <Stack.Screen name="result" options={{ headerShown: false }} />
    </Stack>
  );
}
