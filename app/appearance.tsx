import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useTheme } from "../lib/ThemeContext";
import { usePlayerStats } from "../lib/playerStats";
import { saveProfile } from "../lib/identity";
import {
  useUnlockedAvatars,
  useUnlockedTables,
  entitlementToPackId,
  getCardSkin,
  type EntitlementKey,
  type AvatarSkin,
} from "../lib/skins";
import { AvatarTile } from "../components/appearance/AvatarTile";
import { AvatarHalo } from "../components/appearance/AvatarHalo";
import { TableMiniPreview } from "../components/appearance/TableMiniPreview";

const DOT_COUNT = 10;

export default function AppearanceScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { avatar, selectedTable, userId, profileId } = usePlayerStats();
  const avatars = useUnlockedAvatars();
  const tables = useUnlockedTables();

  const currentAvatar = useMemo(
    () => avatars.find((a) => a.id === avatar) ?? avatars[0],
    [avatars, avatar],
  );
  const unlockedCount = useMemo(() => avatars.filter((a) => a.unlocked).length, [avatars]);
  const selectedIdx = useMemo(
    () => avatars.findIndex((a) => a.id === currentAvatar.id),
    [avatars, currentAvatar.id],
  );
  const activeDotIdx = Math.floor((selectedIdx / Math.max(avatars.length - 1, 1)) * (DOT_COUNT - 1));

  const goPaywall = (requires: EntitlementKey | null) => {
    const packId = entitlementToPackId(requires);
    if (packId) router.push(`/pack/${packId}`);
  };

  const handleAvatar = (skin: AvatarSkin & { unlocked: boolean }) => {
    if (!skin.unlocked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return goPaywall(skin.requires);
    }
    if (skin.id === avatar || !userId) return;
    Haptics.selectionAsync();
    saveProfile(userId, profileId, { avatar: skin.id });
  };

  const handleTable = (id: string, unlocked: boolean, requires: EntitlementKey | null) => {
    if (!unlocked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return goPaywall(requires);
    }
    if (id === selectedTable || !userId) return;
    Haptics.selectionAsync();
    saveProfile(userId, profileId, { selectedTable: id });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={["top"]}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", height: 56, paddingTop: 8, paddingHorizontal: 16, paddingBottom: 4 }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: colors.surfaceContainer,
            alignItems: "center", justifyContent: "center",
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={{
          flex: 1, textAlign: "center",
          fontFamily: "Fredoka_700Bold", fontSize: 20,
          color: colors.onSurface, letterSpacing: -0.3,
        }}>
          {t("apparence.title", "Apparence")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* FOCUS PREVIEW */}
        <Animated.View
          entering={FadeIn.duration(300).delay(50)}
          style={{ position: "relative", paddingTop: 10, paddingBottom: 22, marginBottom: 8, alignItems: "center" }}
        >
          {/* Halo */}
          <View style={{ position: "absolute", top: 20, alignItems: "center", justifyContent: "center", width: 220, height: 220 }}>
            <AvatarHalo hue={currentAvatar.hue} neutral={currentAvatar.neutral} size={220} />
          </View>

          <View style={{ position: "relative" }}>
            <AvatarTile avatar={currentAvatar} size={140} />
          </View>

          <Text style={{
            marginTop: 14,
            fontFamily: "Fredoka_700Bold", fontSize: 28,
            color: colors.onSurface, letterSpacing: -0.6,
            textAlign: "center",
          }}>
            {t(`avatars.${currentAvatar.nameKey}`, currentAvatar.nameKey)}
          </Text>
          <Text style={{
            fontFamily: "Nunito_600SemiBold", fontSize: 12, letterSpacing: 0.5,
            color: colors.onSurfaceMuted, textAlign: "center",
          }}>
            {t("apparence.currentAvatar", "Ton avatar actuel")}
          </Text>

          {/* Carousel dots */}
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 14 }}>
            {Array.from({ length: DOT_COUNT }).map((_, i) => {
              const isActive = i === activeDotIdx;
              return (
                <View
                  key={i}
                  style={{
                    width: isActive ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: isActive ? colors.primaryContainer : colors.ghostBorder,
                  }}
                />
              );
            })}
          </View>
        </Animated.View>

        {/* COLLECTION header */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)}>
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
            <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 16, color: colors.onSurface }}>
              {t("apparence.collection", "Collection")}
            </Text>
            <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 12, color: colors.primaryContainer }}>
              {t("apparence.collectionCount", "{{unlocked}}/{{total}} débloqués", { unlocked: unlockedCount, total: avatars.length })}
            </Text>
          </View>

          {/* Avatar grid 6 cols */}
          <View
            style={{
              backgroundColor: colors.surfaceContainer,
              borderRadius: 20,
              padding: 14,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "space-between",
              marginBottom: 28,
            }}
          >
            {avatars.map((a) => {
              const isSelected = a.id === currentAvatar.id;
              return (
                <Pressable
                  key={a.id}
                  onPress={() => handleAvatar(a)}
                  accessibilityRole="button"
                  accessibilityLabel={t(`avatars.${a.nameKey}`, a.nameKey) + (a.unlocked ? "" : " — verrouillé")}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.94 : 1 }],
                  })}
                >
                  <AvatarTile
                    avatar={a}
                    size={42}
                    ring={isSelected ? colors.primaryContainer : null}
                  />
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* TABLES header */}
        <Animated.View entering={FadeInDown.duration(400).delay(250)}>
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
            <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 16, color: colors.onSurface }}>
              {t("apparence.tables", "Tables")}
            </Text>
            <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 12, color: colors.onSurfaceMuted }}>
              {t("apparence.tablesCount", "{{count}} styles", { count: tables.length })}
            </Text>
          </View>

          {/* Table grid 2x2 — width on outer wrapper for reliable flex-wrap */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14, rowGap: 14, marginBottom: 32 }}>
            {tables.map((tbl) => {
              const isSelected = tbl.id === selectedTable;
              return (
                <View key={tbl.id} style={{ width: "48%" }}>
                  <Pressable
                    onPress={() => handleTable(tbl.id, tbl.unlocked, tbl.requires)}
                    accessibilityRole="button"
                    accessibilityLabel={`Plateau ${tbl.name}` + (tbl.unlocked ? "" : " — verrouillé")}
                    style={({ pressed }) => ({
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                      borderWidth: 2,
                      borderColor: isSelected ? colors.primaryContainer : "transparent",
                      borderRadius: 18,
                      backgroundColor: colors.surfaceContainer,
                      padding: 12,
                      position: "relative",
                    })}
                  >
                    {isSelected && (
                      <View style={{
                        position: "absolute", top: 8, right: 8,
                        width: 20, height: 20, borderRadius: 10,
                        backgroundColor: colors.primaryContainer,
                        alignItems: "center", justifyContent: "center",
                        shadowColor: colors.primaryContainer, shadowOpacity: 0.4,
                        shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
                        elevation: 4, zIndex: 1,
                      }}>
                        <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                      </View>
                    )}

                    <TableMiniPreview
                      frame={tbl.preview.frame}
                      back={tbl.preview.back}
                      face={tbl.preview.face}
                      locked={!tbl.unlocked}
                      skin={getCardSkin(tbl.id)}
                    />

                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6, marginTop: 10 }}>
                      <Text style={{
                        fontFamily: "Fredoka_700Bold", fontSize: 13,
                        color: tbl.unlocked ? colors.onSurface : colors.onSurfaceMuted,
                      }}>
                        {tbl.name}
                      </Text>
                      <Pressable
                        onPress={() => {
                          Haptics.selectionAsync();
                          router.push(`/plateau-preview/${tbl.id}`);
                        }}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel={t("apparence.preview", "Aperçu")}
                        style={({ pressed }) => ({
                          width: 28, height: 28, borderRadius: 14,
                          backgroundColor: colors.primaryContainerBg,
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: pressed ? 0.7 : 1,
                        })}
                      >
                        <Ionicons name="eye-outline" size={15} color={colors.primaryContainer} />
                      </Pressable>
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
