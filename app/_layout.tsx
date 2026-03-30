import "react-native-get-random-values";
import "../global.css";
import "../i18n";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold } from "@expo-google-fonts/fredoka";
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold } from "@expo-google-fonts/nunito";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { PlayerStatsProvider } from "../lib/playerStats";
import { ThemeProvider, useTheme } from "../lib/ThemeContext";

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { colors, isDark } = useTheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.surface);
  }, [isDark]);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.surface },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false, animation: "fade" }} />
        <Stack.Screen name="auth/index" options={{ gestureEnabled: false }} />
        <Stack.Screen name="auth/setup" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="game/index"
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="game/online"
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="room/create" />
        <Stack.Screen name="room/join" />
        <Stack.Screen name="result/index" />
        <Stack.Screen name="player/[id]" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <KeyboardProvider>
      <ThemeProvider>
        <PlayerStatsProvider>
          <AppContent />
        </PlayerStatsProvider>
      </ThemeProvider>
    </KeyboardProvider>
  );
}
