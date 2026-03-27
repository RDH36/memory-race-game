import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { LanguageSelector } from "../../components/settings/LanguageSelector";
import { ThemeSelector } from "../../components/settings/ThemeSelector";
import { useTheme } from "../../lib/ThemeContext";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Pressable
            onPress={() => router.replace("/(tabs)/profile")}
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
            <Ionicons name="arrow-back" size={20} color={colors.onSurfaceVariant} />
          </Pressable>
          <Text style={{ fontSize: 28, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
            {t("settings.title")}
          </Text>
        </View>

        <ThemeSelector />

        <View style={{ marginTop: 24 }} />

        <LanguageSelector />
      </ScrollView>
    </SafeAreaView>
  );
}
