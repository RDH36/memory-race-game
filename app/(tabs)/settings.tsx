import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { FeedbackSupport } from "../../components/settings/FeedbackSupport";
import { LanguageSelector } from "../../components/settings/LanguageSelector";
import { LegalLinks } from "../../components/settings/LegalLinks";
import { ThemeSelector } from "../../components/settings/ThemeSelector";
import { useTheme } from "../../lib/ThemeContext";

const DEVELOPER_URL = "https://www.facebook.com/rdh36/";
const DEVELOPER_NAME = "Raymond Dzery Hago";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: colors.surfaceContainer,
              alignItems: "center",
              justifyContent: "center",
            }}
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

        <View style={{ marginTop: 24 }} />

        <FeedbackSupport />

        <View style={{ marginTop: 24 }} />

        <LegalLinks />

        <Pressable
          onPress={() => Linking.openURL(DEVELOPER_URL)}
          hitSlop={8}
          style={({ pressed }) => ({
            alignItems: "center",
            marginTop: 32,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Nunito_400Regular",
              color: colors.onSurfaceMuted,
              textAlign: "center",
            }}
          >
            {t("settings.developedBy")}{" "}
            <Text
              style={{
                fontFamily: "Nunito_700Bold",
                color: colors.primaryContainer,
              }}
            >
              {DEVELOPER_NAME}
            </Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
