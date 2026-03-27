import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { db } from "@/lib/instant";
import { useTheme } from "../../lib/ThemeContext";
import { BottomSheet } from "../ui/BottomSheet";

type Step = "email" | "code" | "success";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function EmailLinkSheet({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setStep("email");
    setEmail("");
    setCode("");
    setError("");
    setLoading(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSendCode = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      await db.auth.sendMagicCode({ email: email.trim() });
      setStep("code");
    } catch (err: any) {
      setError(err.body?.message ?? t("auth.sendError"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      await db.auth.signInWithMagicCode({ email: email.trim(), code: code.trim() });
      setStep("success");
    } catch (err: any) {
      setError(err.body?.message ?? t("auth.invalidCode"));
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title={t("auth.protectTitle")}>
      {step === "email" && (
        <View style={{ gap: 12 }}>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "Nunito_400Regular" }}>
            {t("auth.protectSubtitle")}
          </Text>
          <TextInput
            placeholder={t("auth.emailPlaceholder")}
            placeholderTextColor={colors.onSurfaceVariant}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            onSubmitEditing={handleSendCode}
            style={{
              backgroundColor: colors.surface,
              color: colors.onSurface,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
            }}
          />
          {error ? <Text style={{ color: colors.error, fontSize: 14, fontFamily: "Nunito_400Regular" }}>{error}</Text> : null}
          <Pressable
            onPress={handleSendCode}
            disabled={loading || !email.trim()}
            style={{
              backgroundColor: colors.primaryContainer,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              opacity: loading || !email.trim() ? 0.4 : 1,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Nunito_700Bold" }}>
              {t("auth.sendCode")}
            </Text>
          </Pressable>
        </View>
      )}

      {step === "code" && (
        <View style={{ gap: 12 }}>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 14, fontFamily: "Nunito_400Regular" }}>
            {t("auth.codeSent", { email })}
          </Text>
          <TextInput
            placeholder={t("auth.codePlaceholder")}
            placeholderTextColor={colors.onSurfaceVariant}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            onSubmitEditing={handleVerifyCode}
            style={{
              backgroundColor: colors.surface,
              color: colors.onSurface,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 20,
              textAlign: "center",
              letterSpacing: 6,
            }}
          />
          {error ? <Text style={{ color: colors.error, fontSize: 14, fontFamily: "Nunito_400Regular" }}>{error}</Text> : null}
          <Pressable
            onPress={handleVerifyCode}
            disabled={loading || !code.trim()}
            style={{
              backgroundColor: colors.primaryContainer,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              opacity: loading || !code.trim() ? 0.4 : 1,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Nunito_700Bold" }}>
              {t("auth.verify")}
            </Text>
          </Pressable>
          <Pressable onPress={() => { setStep("email"); setError(""); setCode(""); }}>
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 13, fontFamily: "Nunito_400Regular", textAlign: "center" }}>
              {t("auth.changeEmail")}
            </Text>
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
            {t("auth.successMessage", { email })}
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
