import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { useUnlockedAvatars, entitlementToPackId } from "../../lib/skins";
import { saveProfile, useCurrentUser } from "../../lib/identity";
import { db } from "../../lib/instant";
import { Avatar, Btn3D, Panel, Ribbon } from "@/components/ui/arcade";
import { LockBadge } from "../../components/ui/LockBadge";

export default function SetupScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { avatar: currentAvatar, nickname: currentNickname, userId, profileId } = usePlayerStats();
  const { user } = useCurrentUser();
  const avatars = useUnlockedAvatars();

  // Guild member (Google account) signs the register; a guest fills in a
  // wanderer's card.
  const isVagabond = !user?.email;

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
          flexGrow: 1, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40,
          justifyContent: "center",
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Enrollment header */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={{ alignItems: "center" }}>
          <Ribbon color={isVagabond ? "violet" : "gold"}>
            {t(isVagabond ? "setup.ribbonVagabond" : "setup.ribbonGuild")}
          </Ribbon>
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(250).duration(500)}
          style={{ fontSize: 28, fontFamily: "Fredoka_700Bold", color: colors.onSurface, textAlign: "center", marginTop: 16 }}
        >
          {t("setup.title")}
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(400).duration(500)}
          style={{ fontSize: 14, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, textAlign: "center", lineHeight: 21, marginTop: 6, marginBottom: 22 }}
        >
          {t(isVagabond ? "setup.subtitleVagabond" : "setup.subtitleGuild")}
        </Animated.Text>

        {/* The record sheet itself — one chunky card */}
        <Animated.View entering={FadeIn.delay(550).duration(500)}>
          <Panel style={{ padding: 18, marginBottom: 24 }}>
            {/* Reincarnation emoji */}
            <View style={{ alignItems: "center", marginBottom: 8 }}>
              <Avatar emoji={selectedAvatar} size={96} color={isVagabond ? "violet" : "gold"} />
              <Text style={{
                fontSize: 12, fontFamily: "Fredoka_700Bold", color: colors.onSurfaceVariant,
                marginTop: 10, letterSpacing: 0.4,
              }}>
                {t("setup.avatarLabel")}
              </Text>
            </View>

            {/* Avatar grid */}
            <View style={{
              flexDirection: "row", flexWrap: "wrap", gap: 10,
              justifyContent: "center", marginTop: 12, marginBottom: 20,
            }}>
              {avatars.map((skin) => {
                const isActive = skin.id === selectedAvatar;
                return (
                  <Pressable
                    key={skin.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      if (!skin.unlocked) {
                        const packId = entitlementToPackId(skin.requires);
                        if (packId) router.push(`/pack/${packId}`);
                        return;
                      }
                      setSelectedAvatar(skin.id);
                    }}
                    style={({ pressed }) => ({
                      width: 52, height: 52, borderRadius: 16,
                      backgroundColor: isActive ? colors.hues.violet[2] : colors.surfaceContainer,
                      alignItems: "center", justifyContent: "center",
                      transform: [{ scale: pressed ? 0.9 : 1 }],
                      opacity: skin.unlocked ? 1 : 0.55,
                      boxShadow: isActive
                        ? `inset 0 0 0 3px ${colors.hues.violet[0]}, 0 3px 0 ${colors.hues.violet[1]}`
                        : `0 3px 0 ${colors.panelLip}`,
                    })}
                  >
                    <Text style={{ fontSize: 26 }}>{skin.emoji}</Text>
                    {!skin.unlocked && <LockBadge size={14} />}
                  </Pressable>
                );
              })}
            </View>

            {/* Hero name */}
            <TextInput
              value={nickname}
              onChangeText={(v) => { setNickname(v); setError(""); }}
              placeholder={t("setup.nicknameLabel")}
              placeholderTextColor={colors.onSurfaceVariant}
              maxLength={20}
              autoCorrect={false}
              style={{
                backgroundColor: colors.surface,
                color: colors.onSurface,
                borderRadius: 18,
                paddingHorizontal: 16, paddingVertical: 16,
                fontSize: 18, fontFamily: "Fredoka_700Bold",
                textAlign: "center",
                boxShadow: `inset 0 2px 4px ${colors.panelShadow}, 0 2px 0 ${colors.panelLip}`,
              }}
            />
          </Panel>
        </Animated.View>

        {error ? (
          <Text style={{ color: colors.error, fontSize: 14, fontFamily: "Nunito_400Regular", textAlign: "center", marginBottom: 16 }}>
            {error}
          </Text>
        ) : null}

        {/* Seal the record */}
        <Animated.View entering={FadeInDown.delay(700).duration(500)}>
          <Btn3D
            color={isVagabond ? "violet" : "gold"}
            size="lg"
            full
            haptic="press"
            label={t(isVagabond ? "setup.continueVagabond" : "setup.continueGuild")}
            onPress={handleSave}
            disabled={!canContinue}
            loading={loading}
          >
            <Text style={{ fontSize: 16 }}>{isVagabond ? "🎒" : "✍️"}</Text>
          </Btn3D>
        </Animated.View>
      </ScrollView>
     </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
