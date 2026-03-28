import { Stack } from "expo-router";
import { useTheme } from "../../lib/ThemeContext";

export default function OnboardingLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        contentStyle: { backgroundColor: colors.surface },
        animation: "slide_from_right",
      }}
    />
  );
}
