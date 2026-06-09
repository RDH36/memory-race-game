import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../lib/ThemeContext";
import { Btn3D, IconBtn, Panel } from "@/components/ui/arcade";
import { ProfileHeader } from "../../components/profile/ProfileHeader";
import { ProfileStats, type StatsTab } from "../../components/profile/ProfileStats";
import { RecentMatches } from "../../components/profile/RecentMatches";
import { APP_VERSION } from "../../lib/constants";
import { useDeferredAnimation } from "../../lib/perf";
import { CoachBubble, useCoachMark } from "@/components/onboarding/CoachBubble";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<StatsTab>("global");
  const matchesReady = useDeferredAnimation();
  const coach = useCoachMark("coach_profile");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
            {t("profile.title")}
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <IconBtn color="white" size={40} onPress={() => router.push("/history")}>
              <Ionicons name="time-outline" size={20} color={colors.onSurfaceVariant} />
            </IconBtn>
            <IconBtn color="white" size={40} onPress={() => router.push("/(tabs)/settings")}>
              <Ionicons name="settings" size={20} color={colors.onSurfaceVariant} />
            </IconBtn>
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <ProfileHeader />
        </View>

        <Panel
          style={{
            marginBottom: 24,
            paddingVertical: 12,
            paddingHorizontal: 14,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: colors.hues.violet[2],
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              boxShadow: `0 3px 0 ${colors.hues.violet[1]}33`,
            }}
          >
            <Text style={{ fontSize: 18 }}>🎨</Text>
          </View>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontSize: 14, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
              {t("profile.appearance", "Apparence")}
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Fredoka_700Bold",
                color: colors.onSurfaceMuted,
                marginTop: 1,
              }}
            >
              {t("profile.appearanceDesc", "Avatar, plateau & skins")}
            </Text>
          </View>
          <Btn3D
            color="violet"
            size="sm"
            label={t("profile.appearanceCta", "Modifier")}
            onPress={() => router.push("/appearance")}
          />
        </Panel>

        <View>
          <ProfileStats
            showProgress={false}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
          />
          {coach.show && (
            <CoachBubble text={t("onboarding.coach.profile")} onDismiss={coach.dismiss} side="above" hue="coral" />
          )}
        </View>

        {matchesReady && <RecentMatches tab={activeTab} />}

        <View style={{ flex: 1 }} />

        <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, textAlign: "center", marginTop: 32 }}>
          Flipia v{APP_VERSION}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
