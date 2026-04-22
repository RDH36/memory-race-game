import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { BottomSheet } from "../ui/BottomSheet";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Label } from "../ui/Label";
import { useTheme } from "../../lib/ThemeContext";
import { useConnectivity } from "../../lib/ConnectivityContext";
import { submitFeedback, type FeedbackCategory } from "../../lib/feedback";

const CATEGORIES: { key: FeedbackCategory; icon: string }[] = [
  { key: "bug", icon: "🐞" },
  { key: "feature", icon: "💡" },
  { key: "question", icon: "❓" },
  { key: "other", icon: "💬" },
];

export function FeedbackSupport() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { requireOnline } = useConnectivity();
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Label text={t("settings.feedback")} />
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Nunito_400Regular",
          color: colors.onSurfaceVariant,
          marginBottom: 12,
          marginTop: -4,
        }}
      >
        {t("settings.feedbackDesc")}
      </Text>
      <Pressable
        onPress={() => requireOnline(() => setOpen(true))}
        style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
      >
        <Card
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            backgroundColor: colors.surfaceContainer,
          }}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={22}
            color={colors.onSurfaceVariant}
          />
          <Text
            style={{
              flex: 1,
              fontSize: 15,
              fontFamily: "Nunito_600SemiBold",
              color: colors.onSurface,
            }}
          >
            {t("feedback.title")}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.onSurfaceVariant}
          />
        </Card>
      </Pressable>

      <FeedbackSheet visible={open} onClose={() => setOpen(false)} />
    </View>
  );
}

function FeedbackSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const [category, setCategory] = useState<FeedbackCategory>("bug");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const reset = () => {
    setCategory("bug");
    setMessage("");
    setEmail("");
    setError("");
    setDone(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 300);
  };

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      setError(t("feedback.errorRequired"));
      return;
    }
    setError("");
    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await submitFeedback({ category, message: trimmed, email });
    setSubmitting(false);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDone(true);
      setTimeout(handleClose, 1800);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(t("feedback.error"));
    }
  };

  if (done) {
    return (
      <BottomSheet visible={visible} onClose={handleClose}>
        <View style={{ alignItems: "center", paddingVertical: 32, gap: 12 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.successBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="checkmark" size={32} color={colors.success} />
          </View>
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Fredoka_700Bold",
              color: colors.onSurface,
            }}
          >
            {t("feedback.success")}
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Nunito_400Regular",
              color: colors.onSurfaceVariant,
              textAlign: "center",
              paddingHorizontal: 20,
            }}
          >
            {t("feedback.successMessage")}
          </Text>
        </View>
      </BottomSheet>
    );
  }

  const inputBg = isDark ? colors.surfaceContainerHigh : colors.surface;

  return (
    <BottomSheet visible={visible} onClose={handleClose} title={t("feedback.title")}>
      <KeyboardAwareScrollView
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 8 }}
      >
        <Text
          style={{
            fontSize: 13,
            fontFamily: "Nunito_400Regular",
            color: colors.onSurfaceVariant,
            marginBottom: 16,
            marginTop: -6,
          }}
        >
          {t("feedback.subtitle")}
        </Text>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 18 }}>
          {CATEGORIES.map((cat) => {
            const active = cat.key === category;
            return (
              <Pressable
                key={cat.key}
                onPress={() => {
                  Haptics.selectionAsync();
                  setCategory(cat.key);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: active ? colors.primaryContainer : inputBg,
                }}
              >
                <Text style={{ fontSize: 20 }}>{cat.icon}</Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Nunito_700Bold",
                    color: active ? "#FFF" : colors.onSurfaceVariant,
                  }}
                >
                  {t("feedback.category." + cat.key)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Label text={t("feedback.messageLabel")} />
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder={t("feedback.messagePlaceholder")}
          placeholderTextColor={colors.onSurfaceVariant}
          multiline
          maxLength={1000}
          style={{
            backgroundColor: inputBg,
            borderRadius: 12,
            padding: 12,
            minHeight: 110,
            textAlignVertical: "top",
            color: colors.onSurface,
            fontSize: 14,
            fontFamily: "Nunito_400Regular",
            marginBottom: 14,
          }}
        />

        <Label text={t("feedback.emailLabel")} />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t("feedback.emailPlaceholder")}
          placeholderTextColor={colors.onSurfaceVariant}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            backgroundColor: inputBg,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: colors.onSurface,
            fontSize: 14,
            fontFamily: "Nunito_400Regular",
            marginBottom: 18,
          }}
        />

        {error ? (
          <Text
            style={{
              color: colors.error,
              fontSize: 13,
              fontFamily: "Nunito_600SemiBold",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            {error}
          </Text>
        ) : null}

        <Button
          text={submitting ? t("feedback.submitting") : t("feedback.submit")}
          icon="📨"
          onPress={handleSubmit}
          loading={submitting}
        />
      </KeyboardAwareScrollView>
    </BottomSheet>
  );
}
