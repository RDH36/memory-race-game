import { Stack } from "expo-router";

export default function StoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {/* Full-bleed letterboxed scenes fade like the prelude */}
      <Stack.Screen name="scene" options={{ animation: "fade" }} />
    </Stack>
  );
}
