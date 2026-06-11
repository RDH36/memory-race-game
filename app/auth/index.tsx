import { useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { db } from "@/lib/instant";
import { useTheme } from "@/lib/ThemeContext";
import { useConnectivity } from "@/lib/ConnectivityContext";
import { radii } from "../../components/ui/theme";
import { Btn3D, Ribbon } from "@/components/ui/arcade";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { GuildHero } from "@/components/auth/GuildHero";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export default function AuthScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const { isOnline, requireOnline } = useConnectivity();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (response.type === "cancelled") {
        setGoogleLoading(false);
        return;
      }
      const idToken = response.data?.idToken;
      if (!idToken) throw new Error("No idToken");
      await db.auth.signInWithIdToken({
        clientName: "google-auth",
        idToken,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/");
    } catch (err: any) {
      setError(err.body?.message ?? err.message ?? t("auth.googleError"));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    try {
      await db.auth.signInAsGuest();
      router.replace("/auth/setup");
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Hero — the Guild welcomes its newest recruit */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Ribbon color="gold">{t("auth.guildRibbon")}</Ribbon>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(300).duration(600)} style={{ marginTop: 26 }}>
          <GuildHero />
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(600).duration(500)}
          style={{
            fontSize: 28,
            fontFamily: "Fredoka_700Bold",
            color: colors.onSurface,
            textAlign: "center",
            lineHeight: 36,
            marginTop: 14,
          }}
        >
          {t("auth.guildTitle")}
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(800).duration(500)}
          style={{
            fontSize: 14,
            fontFamily: "Nunito_400Regular",
            color: colors.onSurfaceVariant,
            textAlign: "center",
            lineHeight: 21,
            marginTop: 10,
          }}
        >
          {t("auth.guildSubtitle")}
        </Animated.Text>
      </View>

      {/* Auth buttons — pinned at bottom */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
        <Animated.View entering={FadeIn.duration(300)} style={{ gap: 12 }}>
          {error ? (
            <Animated.View entering={FadeIn.duration(200)} style={{
              backgroundColor: colors.errorBg,
              borderRadius: radii.sm, paddingHorizontal: 12, paddingVertical: 10,
              flexDirection: "row", alignItems: "center", gap: 8,
            }}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={{ color: colors.error, fontSize: 14, fontFamily: "Nunito_400Regular", flex: 1 }}>{error}</Text>
            </Animated.View>
          ) : null}

          <Btn3D
            color="white"
            size="lg"
            full
            haptic="press"
            label={t("auth.joinGuild")}
            onPress={() => requireOnline(handleGoogle)}
            loading={googleLoading}
            disabled={!isOnline}
            style={{ marginTop: 4 }}
          >
            <GoogleIcon size={20} />
          </Btn3D>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginVertical: 6 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.surfaceContainerHigh }} />
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontFamily: "Fredoka_700Bold" }}>
              {t("auth.or")}
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.surfaceContainerHigh }} />
          </View>

          <Btn3D
            color="violet"
            size="lg"
            full
            haptic="press"
            label={t("auth.vagabond")}
            onPress={() => requireOnline(handleGuest)}
            loading={guestLoading}
            disabled={!isOnline}
          >
            <Text style={{ fontSize: 16 }}>🎒</Text>
          </Btn3D>
        </Animated.View>
      </View>

      {/* Legal footer */}
      <View style={{ paddingHorizontal: 32, paddingBottom: 16, paddingTop: 12 }}>
        <Text style={{
          fontSize: 11, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant,
          textAlign: "center", lineHeight: 16,
        }}>
          {t("auth.legal").replace(/<\/?[a-z]+>/g, "")}
        </Text>
      </View>
    </SafeAreaView>
  );
}
