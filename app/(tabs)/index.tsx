import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { ModeCard } from "../../components/home/ModeCard";
import { BotSelectCard } from "../../components/home/BotSelectCard";
import { StatsRow } from "../../components/home/StatsRow";
import { Label } from "../../components/ui/Label";
import { BottomSheet } from "../../components/ui/BottomSheet";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { MitsitsyCard } from "../../components/promo/MitsitsyCard";

const BOT_DATA = [
  { key: "easy", name: "BabyBot", avatar: "🐣", color: "#1D9E75", pairs: 6, power: 1 },
  { key: "medium", name: "NekoFlash", avatar: "🦊", color: "#A2340A", pairs: 8, power: 2 },
  { key: "hard", name: "AlphaMemory", avatar: "🤖", color: "#534AB7", pairs: 12, power: 3 },
] as const;

const CASUAL_OPTIONS = [
  { key: "matchmaking", icon: "🎲", titleKey: "room.matchmaking", descKey: "room.matchmakingDesc", color: "#D4820A" },
  { key: "create", icon: "🏠", titleKey: "room.createRoom", descKey: "room.createDesc", color: "#1D9E75" },
  { key: "join", icon: "🔗", titleKey: "room.joinRoom", descKey: "room.joinDesc", color: "#534AB7" },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { stats, avatar, level, levelProgress, xpInLevel, xpForNextLevel } = usePlayerStats();
  const { colors, isDark } = useTheme();
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [showCasual, setShowCasual] = useState(false);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={["top"]}>
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
            onPress={() => setShowCasual(true)}
          />
        </View>

        {/* Stats */}
        <Label text={t("home.myStats")} />
        <StatsRow />

        {/* Cross-promo Mitsitsy */}
        <View style={{ marginTop: 28 }}>
          <MitsitsyCard />
        </View>
      </ScrollView>

      {/* Difficulty Modal */}
      <BottomSheet
        visible={showDifficulty}
        onClose={() => setShowDifficulty(false)}
        title={t("home.chooseDifficulty")}
      >
        <View style={{ gap: 12 }}>
          {BOT_DATA.map((bot, index) => (
            <BotSelectCard
              key={bot.key}
              botKey={bot.key}
              name={bot.name}
              avatar={bot.avatar}
              color={bot.color}
              pairs={bot.pairs}
              power={bot.power}
              index={index}
              loading={loading}
              onPress={() => handleSelectDifficulty(bot.key)}
            />
          ))}
        </View>
      </BottomSheet>

      {/* Casual Mode Modal */}
      <BottomSheet
        visible={showCasual}
        onClose={() => setShowCasual(false)}
        title={t("room.casualTitle")}
      >
        <View style={{ gap: 12 }}>
          {CASUAL_OPTIONS.map((opt, index) => (
            <Animated.View key={opt.key} entering={FadeInDown.delay(index * 80).duration(350).springify().damping(14)}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowCasual(false);
                  setTimeout(() => {
                    const routes = {
                      matchmaking: "/room/matchmaking",
                      create: "/room/create",
                      join: "/room/join",
                    } as const;
                    router.push(routes[opt.key]);
                  }, 300);
                }}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                })}
              >
                <View
                  style={{
                    backgroundColor: isDark ? colors.surfaceContainerHigh : colors.surfaceContainer,
                    borderRadius: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: opt.color,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 18,
                    gap: 14,
                  }}
                >
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: opt.color + "18",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 26 }}>{opt.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 17, fontFamily: "Fredoka_700Bold", color: opt.color }}>
                      {t(opt.titleKey)}
                    </Text>
                    <Text style={{ fontSize: 12, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant, marginTop: 3 }}>
                      {t(opt.descKey)}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: opt.color + "14",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 16, color: opt.color, fontFamily: "Fredoka_700Bold" }}>{">"}</Text>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
