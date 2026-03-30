import { Pressable, ScrollView, Text, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../lib/ThemeContext";
import { ProfileHeader } from "../../components/profile/ProfileHeader";
import { ProfileStats } from "../../components/profile/ProfileStats";
import { Card } from "../../components/ui/Card";
import { APP_VERSION } from "../../lib/constants";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={["top"]}>
     <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
            {t("profile.title")}
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/settings")}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: colors.surfaceContainer,
              alignItems: "center",
              justifyContent: "center",
              transform: [{ scale: pressed ? 0.9 : 1 }],
            })}
          >
            <Ionicons name="settings" size={20} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>

        <View style={{ marginBottom: 24 }}>
          <ProfileHeader />
        </View>

        <ProfileStats />

        <View style={{ flex: 1 }} />

        <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, textAlign: "center", marginTop: 32 }}>
          Flipia v{APP_VERSION}
        </Text>
      </ScrollView>
     </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
