import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../lib/ThemeContext";
import { ProfileHeader } from "../../components/profile/ProfileHeader";
import { ProfileStats, type StatsTab } from "../../components/profile/ProfileStats";
import { RecentMatches } from "../../components/profile/RecentMatches";
import { Card } from "../../components/ui/Card";
import { APP_VERSION } from "../../lib/constants";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<StatsTab>("global");

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
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() => router.push("/history")}
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
              <Ionicons name="time-outline" size={20} color={colors.onSurfaceVariant} />
            </Pressable>
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
        </View>

        <View style={{ marginBottom: 16 }}>
          <ProfileHeader />
        </View>

        <View
          style={{
            marginBottom: 24,
            backgroundColor: colors.surfaceContainer,
            borderRadius: 14,
            paddingVertical: 12,
            paddingHorizontal: 14,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: colors.primaryContainerBg,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 18 }}>🎨</Text>
          </View>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontSize: 13, fontFamily: "Fredoka_600SemiBold", color: colors.onSurface }}>
              {t("profile.appearance", "Apparence")}
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Nunito_400Regular",
                color: colors.onSurfaceVariant,
                marginTop: 1,
              }}
            >
              {t("profile.appearanceDesc", "Avatar, plateau & skins")}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/appearance")}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 18,
              paddingVertical: 10,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 13, fontFamily: "Nunito_700Bold", color: "#FFF" }}>
              {t("profile.appearanceCta", "Modifier")}
            </Text>
          </Pressable>
        </View>

        <ProfileStats
          showProgress={false}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />

        <RecentMatches tab={activeTab} />

        <View style={{ flex: 1 }} />

        <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, textAlign: "center", marginTop: 32 }}>
          Flipia v{APP_VERSION}
        </Text>
      </ScrollView>
     </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
