import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#F5F5F0" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="game/index"
          options={{ animation: "slide_from_right", gestureEnabled: false }}
        />
        <Stack.Screen
          name="result/index"
          options={{ animation: "slide_from_bottom" }}
        />
      </Stack>
    </>
  );
}
