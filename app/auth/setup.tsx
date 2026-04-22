import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats, AVATARS } from "../../lib/playerStats";
import { saveProfile } from "../../lib/identity";
import { db } from "../../lib/instant";
import { radii } from "../../components/ui/theme";
import { Button } from "../../components/ui/Button";

export default function SetupScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { avatar: currentAvatar, nickname: currentNickname, userId, profileId } = usePlayerStats();

  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || "🧠");
  const [nickname, setNickname] = useState(currentNickname || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canContinue = nickname.trim().length >= 2;

  const handleSave = async () => {
    if (!userId || !canContinue) return;
    setLoading(true);
    setError("");
    try {
      // Check nickname uniqueness
      const trimmed = nickname.trim();
      const { data } = await db.queryOnce({ profiles: { $: { where: { nickname: trimmed } } } });
      const taken = data.profiles.some((p: any) => p.userId !== userId);
      if (taken) {
        setError(t("setup.nicknameTaken"));
        setLoading(false);
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await saveProfile(userId, profileId, { nickname: trimmed, avatar: selectedAvatar });
      router.replace("/(tabs)");
    } catch {
      setError(t("setup.saveError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
     <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40,
          justifyContent: "center",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 28, fontFamily: "Fredoka_700Bold", color: colors.onSurface, textAlign: "center" }}>
          {t("setup.title")}
        </Text>
        <Text style={{ fontSize: 14, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, textAlign: "center", marginTop: 6, marginBottom: 32 }}>
          {t("setup.subtitle")}
        </Text>

        {/* Selected avatar (large, white circle) */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <View style={{
            width: 100, height: 100, borderRadius: 50,
            backgroundColor: "#FFFFFF",
            alignItems: "center", justifyContent: "center",
          }}>
            <Text style={{ fontSize: 52 }}>{selectedAvatar}</Text>
          </View>
        </View>

        {/* Avatar grid */}
        <View style={{
          flexDirection: "row", flexWrap: "wrap", gap: 10,
          justifyContent: "center", marginBottom: 32,
        }}>
          {AVATARS.map((emoji) => {
            const isActive = emoji === selectedAvatar;
            return (
              <Pressable
                key={emoji}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedAvatar(emoji);
                }}
                style={({ pressed }) => ({
                  width: 52, height: 52, borderRadius: 26,
                  backgroundColor: isActive ? colors.primaryContainerBg : "#FFFFFF",
                  borderWidth: isActive ? 2.5 : 0,
                  borderColor: colors.primaryContainer,
                  alignItems: "center", justifyContent: "center",
                  transform: [{ scale: pressed ? 0.9 : 1 }],
                })}
              >
                <Text style={{ fontSize: 26 }}>{emoji}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Nickname input */}
        <TextInput
          value={nickname}
          onChangeText={(v) => { setNickname(v); setError(""); }}
          placeholder={t("setup.nicknameLabel")}
          placeholderTextColor={colors.onSurfaceVariant}
          maxLength={20}
          autoCorrect={false}
          style={{
            backgroundColor: colors.surfaceContainer,
            color: colors.onSurface,
            borderRadius: radii.md,
            paddingHorizontal: 16, paddingVertical: 16,
            fontSize: 18, fontFamily: "Nunito_600SemiBold",
            textAlign: "center",
            marginBottom: error ? 8 : 32,
          }}
        />

        {error ? (
          <Text style={{ color: colors.error, fontSize: 14, fontFamily: "Nunito_400Regular", textAlign: "center", marginBottom: 16 }}>
            {error}
          </Text>
        ) : null}

        {/* Continue button */}
        <Button
          text={t("setup.continue")}
          onPress={handleSave}
          disabled={!canContinue}
          loading={loading}
        />
      </ScrollView>
     </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
