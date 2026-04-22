import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../lib/ThemeContext";
import { useProfile } from "../../lib/identity";
import { db } from "../../lib/instant";
import { Card } from "../../components/ui/Card";
import { LoadingCard } from "../../components/ui/LoadingCard";
import { ProfileStats } from "../../components/profile/ProfileStats";
import { useGameModeStats } from "../../lib/gameModeStats";

function computeLevel(xp: number) {
  let level = 1;
  let total = 0;
  while (true) {
    const needed = level * 75;
    if (xp < total + needed) {
      return { level, xpInLevel: xp - total, xpForNext: needed, progress: (xp - total) / needed };
    }
    total += needed;
    level++;
  }
}

export default function PlayerProfileScreen() {
  const { id: userId } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  const { profile, isLoading: profileLoading } = useProfile(userId);
  const { data: lbData, isLoading: lbLoading } = db.useQuery(
    userId ? { leaderboard: { $: { where: { userId } } } } : null,
  );
  const modeStats = useGameModeStats(userId);

  const entry = lbData?.leaderboard?.[0];
  const isLoading = profileLoading || lbLoading;

  const nickname = profile?.nickname ?? "???";
  const avatar = profile?.avatar ?? "🧠";
  const points = entry?.points ?? 0;
  const gamesPlayed = entry?.gamesPlayed ?? 0;
  const gamesWon = entry?.gamesWon ?? 0;
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const levelInfo = computeLevel(points);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
        <LoadingCard />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with back button */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: colors.surfaceContainer,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.onSurfaceVariant} />
          </Pressable>
          <Text style={{ fontSize: 28, fontFamily: "Fredoka_700Bold", color: colors.onSurface, marginLeft: 12 }}>
            {nickname}
          </Text>
        </View>

        {/* Player card */}
        <Card style={{ alignItems: "center", gap: 12, marginBottom: 20 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 40 }}>{avatar}</Text>
          </View>

          <Text style={{ fontSize: 22, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
            {nickname}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 }}>
            <View style={{ backgroundColor: colors.primaryContainerBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
              <Text style={{ fontSize: 13, fontFamily: "Nunito_700Bold", color: colors.primaryContainer }}>
                Nv. {levelInfo.level}
              </Text>
            </View>
            <View style={{ backgroundColor: colors.primaryContainerBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
              <Text style={{ fontSize: 13, fontFamily: "Nunito_700Bold", color: colors.primaryContainer }}>
                {points.toLocaleString()} XP
              </Text>
            </View>
          </View>
        </Card>

        {/* Same tabs as own profile */}
        <ProfileStats
          showProgress={false}
          externalData={{
            gamesPlayed,
            gamesWon,
            currentStreak: entry?.currentStreak ?? 0,
            bestStreak: entry?.bestStreak ?? 0,
            points,
            winRate,
            level: levelInfo.level,
            levelProgress: levelInfo.progress,
            xpInLevel: levelInfo.xpInLevel,
            xpForNextLevel: levelInfo.xpForNext,
          }}
          externalModeStats={modeStats}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
