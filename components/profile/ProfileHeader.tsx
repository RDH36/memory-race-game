import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../ui/Card";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { useCurrentUser, saveProfile } from "../../lib/identity";
import { GoogleLinkSheet } from "./GoogleLinkSheet";

export function ProfileHeader() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { stats, avatar, nickname, profileId, userId, level } = usePlayerStats();
  const { user } = useCurrentUser();

  const [showGoogle, setShowGoogle] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const hasEmail = !!user?.email;
  const displayName = nickname || t("profile.guest");

  const startEdit = () => { setDraft(nickname); setEditing(true); };

  const saveNickname = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (!trimmed || !userId) return;
    saveProfile(userId, profileId, { nickname: trimmed });
  };

  return (
    <>
      <Card style={{ alignItems: "center", gap: 12 }}>
        {/* Avatar — white rounded bg, tap to go to setup */}
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/auth/setup"); }}
          style={({ pressed }) => ({
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: "#FFFFFF",
            alignItems: "center", justifyContent: "center",
            shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          })}
        >
          <Text style={{ fontSize: 40 }}>{avatar}</Text>
        </Pressable>

        {/* Nickname (editable inline) */}
        {editing ? (
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onBlur={saveNickname}
            onSubmitEditing={saveNickname}
            autoFocus
            maxLength={20}
            placeholder={t("profile.nicknamePlaceholder")}
            placeholderTextColor={colors.onSurfaceVariant}
            style={{
              fontSize: 22, fontFamily: "Fredoka_700Bold", color: colors.onSurface,
              textAlign: "center", borderBottomWidth: 2,
              borderBottomColor: colors.primaryContainer, paddingBottom: 4, minWidth: 120,
            }}
          />
        ) : (
          <Pressable onPress={startEdit} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 22, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
              {displayName}
            </Text>
            <Ionicons name="pencil" size={14} color={colors.onSurfaceVariant} />
          </Pressable>
        )}

        {/* Email status */}
        {hasEmail ? (
          <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.success }}>
            {t("auth.linked")} {user?.email}
          </Text>
        ) : (
          <Pressable
            onPress={() => setShowGoogle(true)}
            style={{
              flexDirection: "row", alignItems: "center", gap: 6,
              backgroundColor: colors.primaryContainerBg,
              paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
            }}
          >
            <Ionicons name="logo-google" size={14} color={colors.primaryContainer} />
            <Text style={{ fontSize: 13, fontFamily: "Nunito_600SemiBold", color: colors.primaryContainer }}>
              {t("profile.linkGoogle")}
            </Text>
          </Pressable>
        )}

        {/* Badges */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 }}>
          <View style={{ backgroundColor: colors.primaryContainerBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
            <Text style={{ fontSize: 13, fontFamily: "Nunito_700Bold", color: colors.primaryContainer }}>
              Nv. {level}
            </Text>
          </View>
          <View style={{ backgroundColor: colors.primaryContainerBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
            <Text style={{ fontSize: 13, fontFamily: "Nunito_700Bold", color: colors.primaryContainer }}>
              {stats.points.toLocaleString()} XP
            </Text>
          </View>
        </View>
      </Card>

      <GoogleLinkSheet visible={showGoogle} onClose={() => setShowGoogle(false)} />
    </>
  );
}
