import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as Haptics from "expo-haptics";
import { db } from "@/lib/instant";
import { useTheme } from "../../lib/ThemeContext";
import { BottomSheet } from "../ui/BottomSheet";
import { GoogleIcon } from "../ui/GoogleIcon";

type Step = "prompt" | "success";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function GoogleLinkSheet({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [step, setStep] = useState<Step>("prompt");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [linkedEmail, setLinkedEmail] = useState("");

  const reset = () => {
    setStep("prompt");
    setError("");
    setLoading(false);
    setLinkedEmail("");
  };

  const handleClose = () => { reset(); onClose(); };

  const handleGoogleLink = async () => {
    setLoading(true);
    setError("");
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (response.type === "cancelled") {
        setLoading(false);
        return;
      }
      const idToken = response.data?.idToken;
      if (!idToken) throw new Error("No idToken");
      await db.auth.signInWithIdToken({
        clientName: "google-auth",
        idToken,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setLinkedEmail(response.data?.user?.email ?? "");
      setStep("success");
    } catch (err: any) {
      setError(err.body?.message ?? err.message ?? t("auth.googleError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title={t("auth.protectTitle")}>
      {step === "prompt" && (
        <View style={{ gap: 16, alignItems: "center" }}>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "Nunito_400Regular", textAlign: "center" }}>
            {t("auth.protectSubtitle")}
          </Text>

          {error ? (
            <View style={{
              backgroundColor: colors.errorBg,
              borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
              flexDirection: "row", alignItems: "center", gap: 8, width: "100%",
            }}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={{ color: colors.error, fontSize: 14, fontFamily: "Nunito_400Regular", flex: 1 }}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleGoogleLink}
            disabled={loading}
            style={{
              backgroundColor: colors.primaryContainer,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 10,
              width: "100%",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <GoogleIcon size={20} />
                <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Nunito_700Bold" }}>
                  {t("auth.continueGoogle")}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      )}

      {step === "success" && (
        <View style={{ gap: 16, alignItems: "center" }}>
          <Text style={{ fontSize: 48 }}>✅</Text>
          <Text style={{ color: colors.onSurface, fontSize: 16, fontFamily: "Nunito_700Bold" }}>
            {t("auth.successTitle")}
          </Text>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, textAlign: "center" }}>
            {t("auth.successMessage", { email: linkedEmail })}
          </Text>
          <Pressable
            onPress={handleClose}
            style={{
              backgroundColor: colors.primaryContainer,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              width: "100%",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Nunito_700Bold" }}>
              {t("auth.close")}
            </Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}
