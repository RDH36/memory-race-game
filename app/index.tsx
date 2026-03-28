import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCurrentUser, useProfile } from "../lib/identity";
import { useTheme } from "../lib/ThemeContext";
import { LoadingCard } from "../components/ui/LoadingCard";

export default function RootIndex() {
  const { user, isLoading: authLoading } = useCurrentUser();
  const { colors } = useTheme();
  const { profile, isLoading: profileLoading } = useProfile(user?.id);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("onboarding_complete").then((v) => setOnboardingDone(v === "true"));
  }, []);

  // Wait for onboarding check first (fast AsyncStorage read)
  if (onboardingDone === null) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <LoadingCard />
      </View>
    );
  }

  // Onboarding not completed → tutorial (before auth)
  if (!onboardingDone) return <Redirect href="/onboarding" />;

  // Wait for auth to resolve
  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <LoadingCard />
      </View>
    );
  }

  // Not signed in → auth page
  if (!user) return <Redirect href="/auth" />;

  // Wait for profile query to finish before deciding
  if (profileLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <LoadingCard />
      </View>
    );
  }

  // Signed in but no nickname → setup page
  if (!profile?.nickname) return <Redirect href="/auth/setup" />;

  // All good → main app
  return <Redirect href="/(tabs)" />;
}
