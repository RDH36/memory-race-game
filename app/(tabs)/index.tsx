import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { ModeCard } from "../../components/home/ModeCard";
import { StatsRow } from "../../components/home/StatsRow";
import { Label } from "../../components/ui/Label";
import { Card } from "../../components/ui/Card";
import { BottomSheet } from "../../components/ui/BottomSheet";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";

const DIFFICULTY_KEYS = [
  { key: "easy", icon: "🐣", color: "#1D9E75" },
  { key: "medium", icon: "🦊", color: "#A2340A" },
  { key: "hard", icon: "🔥", color: "#534AB7" },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { stats, avatar, level, levelProgress, xpInLevel, xpForNextLevel } = usePlayerStats();
  const { colors, isDark } = useTheme();
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectDifficulty = (difficulty: string) => {
    if (loading) return;
    setLoading(difficulty);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDifficulty(false);
    setTimeout(() => {
      router.push({ pathname: "/game", params: { difficulty, mode: "solo" } });
      setLoading(null);
    }, 350);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginTop: 8, marginBottom: 28 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View style={{ flex: 1 }}>
              <Label text={t("home.welcome")} style={{ marginBottom: 6 }} />
              <Text style={{ fontSize: 36, color: colors.primaryContainer }} className="font-display">
                Flipia
              </Text>
            </View>
            <View style={{ alignItems: "center", marginTop: 8 }}>
              <Text style={{ fontSize: 42 }}>{avatar}</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 6,
                  backgroundColor: colors.primaryContainerBg,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontSize: 13, fontFamily: "Nunito_700Bold", color: colors.primaryContainer }}>
                  Nv. {level} · {stats.points} XP
                </Text>
              </View>
            </View>
          </View>

          {/* XP bar */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 14, gap: 8 }}>
            <Text style={{ fontSize: 11, fontFamily: "Nunito_700Bold", color: colors.onSurface }}>
              Nv. {level}
            </Text>
            <View style={{ flex: 1, height: 4, backgroundColor: isDark ? "#333" : "#E8E4E4", borderRadius: 2 }}>
              <View style={{ width: `${Math.round(levelProgress * 100)}%`, height: 4, backgroundColor: colors.primaryContainer, borderRadius: 2 }} />
            </View>
            <Text style={{ fontSize: 11, fontFamily: "Nunito_700Bold", color: colors.onSurfaceVariant }}>
              Nv. {level + 1}
            </Text>
          </View>
          <Text style={{ fontSize: 10, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, textAlign: "right", marginTop: 4 }}>
            {xpInLevel} / {xpForNextLevel} XP
          </Text>
        </View>

        {/* Mode selection */}
        <Label text={t("home.chooseMode")} />
        <View style={{ gap: 12, marginBottom: 28 }}>
          <ModeCard
            icon="🏆"
            title={t("home.modes.ranked")}
            desc={t("home.modes.rankedDesc")}
            badge={t("home.modes.rankedBadge")}
            badgeColor="#A2340A"
            disabled
            onPress={() => {}}
          />
          <ModeCard
            icon="🎮"
            title={t("home.modes.solo")}
            desc={t("home.modes.soloDesc")}
            badge={t("home.modes.soloBadge")}
            badgeColor="#534AB7"
            onPress={() => setShowDifficulty(true)}
          />
          <ModeCard
            icon="🔥"
            title={t("home.modes.casual")}
            desc={t("home.modes.casualDesc")}
            badge={t("home.modes.casualBadge")}
            badgeColor="#1D9E75"
            disabled
            onPress={() => {}}
          />
        </View>

        {/* Stats */}
        <Label text={t("home.myStats")} />
        <StatsRow />
      </ScrollView>

      {/* Difficulty Modal */}
      <BottomSheet
        visible={showDifficulty}
        onClose={() => setShowDifficulty(false)}
        title={t("home.chooseDifficulty")}
      >
        <View style={{ gap: 10 }}>
          {DIFFICULTY_KEYS.map((d) => (
            <Pressable
              key={d.key}
              onPress={() => handleSelectDifficulty(d.key)}
              disabled={loading !== null}
              style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
            >
              <Card
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  opacity: loading && loading !== d.key ? 0.4 : 1,
                  backgroundColor: colors.surfaceContainerHigh,
                }}
              >
                <Text style={{ fontSize: 28 }}>{d.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontFamily: "Fredoka_600SemiBold", color: d.color }}>
                    {t(`home.difficulty.${d.key}`)}
                  </Text>
                  <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginTop: 2 }}>
                    {t(`home.difficulty.${d.key}Desc`)}
                  </Text>
                </View>
                {loading === d.key ? (
                  <Text style={{ fontSize: 14, color: colors.onSurfaceVariant }}>⏳</Text>
                ) : (
                  <Text style={{ fontSize: 18, color: d.color }}>→</Text>
                )}
              </Card>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
