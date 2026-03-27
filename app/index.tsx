import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useCurrentUser, useProfile } from "../lib/identity";
import { useTheme } from "../lib/ThemeContext";

export default function RootIndex() {
  const { user, isLoading: authLoading } = useCurrentUser();
  const { colors } = useTheme();
  const { profile, isLoading: profileLoading } = useProfile(user?.id);

  // Wait for auth to resolve
  if (authLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface }}>
        <ActivityIndicator size="large" color={colors.primaryContainer} />
      </View>
    );
  }

  // Not signed in → auth page
  if (!user) return <Redirect href="/auth" />;

  // Wait for profile query to finish before deciding
  if (profileLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface }}>
        <ActivityIndicator size="large" color={colors.primaryContainer} />
      </View>
    );
  }

  // Signed in but no nickname → setup page
  if (!profile?.nickname) return <Redirect href="/auth/setup" />;

  // All good → main app
  return <Redirect href="/(tabs)" />;
}
