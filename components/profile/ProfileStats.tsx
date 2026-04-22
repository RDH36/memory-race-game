import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Card } from "../ui/Card";
import { Label } from "../ui/Label";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { useGameModeStats, type GameModeStats } from "../../lib/gameModeStats";

export type StatsTab = "global" | "vsAi" | "vsFriends";

export interface ExternalStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  points: number;
  winRate: number;
  level: number;
  levelProgress: number;
  xpInLevel: number;
  xpForNextLevel: number;
}

function StatCell({ value, label }: { value: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", paddingVertical: 10 }}>
      <Text style={{ fontSize: 22, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
        {value}
      </Text>
      <Text style={{ fontSize: 11, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginTop: 4 }}>
        {label}
      </Text>
    </View>
  );
}

function StatsTabBar({ active, onChange }: { active: StatsTab; onChange: (t: StatsTab) => void }) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const tabs: { key: StatsTab; label: string }[] = [
    { key: "global", label: t("profile.tabGlobal") },
    { key: "vsAi", label: t("profile.tabVsAi") },
    { key: "vsFriends", label: t("profile.tabVsFriends") },
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: isDark ? "#1E1E1E" : "#F0ECEC",
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 10,
              alignItems: "center",
              backgroundColor: isActive ? colors.surface : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontFamily: isActive ? "Nunito_700Bold" : "Nunito_600SemiBold",
                color: isActive ? colors.onSurface : colors.onSurfaceVariant,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ModeStatRow({ label, stats }: {
  label: string;
  stats: { gamesPlayed: number; gamesWon: number; winRate: number };
}) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ fontSize: 14, fontFamily: "Fredoka_600SemiBold", color: useTheme().colors.onSurface }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row" }}>
        <StatCell value={`${stats.gamesPlayed}`} label={t("profile.gamesPlayed")} />
        <StatCell value={`${stats.gamesWon}`} label={t("profile.gamesWon")} />
        <StatCell
          value={stats.gamesPlayed > 0 ? `${stats.winRate}%` : "—"}
          label={t("profile.winRate")}
        />
      </View>
    </View>
  );
}

function GlobalTab({ data, showProgress = true }: { data: ExternalStats; showProgress?: boolean }) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  return (
    <View style={{ gap: 20 }}>
      {showProgress && (
        <View>
          <Label text={t("profile.levelTitle")} />
          <Card style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 16, fontFamily: "Fredoka_600SemiBold", color: colors.onSurface }}>
                {t("profile.level", { level: data.level })}
              </Text>
              <Text style={{ fontSize: 15, fontFamily: "Fredoka_700Bold", color: colors.primaryContainer }}>
                {data.points.toLocaleString()} XP
              </Text>
            </View>
            <View>
              <View style={{ height: 8, backgroundColor: isDark ? "#333" : "#E8E4E4", borderRadius: 4 }}>
                <View
                  style={{
                    width: `${Math.round(data.levelProgress * 100)}%`,
                    height: 8,
                    backgroundColor: colors.primaryContainer,
                    borderRadius: 4,
                  }}
                />
              </View>
              <Text style={{ fontSize: 11, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginTop: 6, textAlign: "right" }}>
                {data.xpInLevel} / {data.xpForNextLevel} XP
              </Text>
            </View>
          </Card>
        </View>
      )}

      <View>
        <Label text={t("profile.statsTitle")} />
        <Card style={{ gap: 0, paddingVertical: 8, paddingHorizontal: 8 }}>
          <View style={{ flexDirection: "row" }}>
            <StatCell value={`${data.gamesPlayed}`} label={t("profile.gamesPlayed")} />
            <StatCell
              value={data.gamesPlayed > 0 ? `${data.winRate}%` : "—"}
              label={t("profile.winRate")}
            />
          </View>
          <View style={{ height: 1, backgroundColor: isDark ? "#2A2A2A" : "#F0ECEC", marginHorizontal: 8 }} />
          <View style={{ flexDirection: "row" }}>
            <StatCell value={`${data.currentStreak} 🔥`} label={t("profile.currentStreak")} />
            <StatCell value={`${data.bestStreak} 🔥`} label={t("profile.bestStreak")} />
          </View>
        </Card>
      </View>
    </View>
  );
}

function VsAiTab({ modeStats }: { modeStats: GameModeStats | null }) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  if (!modeStats || modeStats.aiEasy.gamesPlayed + modeStats.aiMedium.gamesPlayed + modeStats.aiHard.gamesPlayed === 0) {
    return (
      <Card style={{ alignItems: "center", paddingVertical: 32 }}>
        <Text style={{ fontSize: 32, marginBottom: 8 }}>🤖</Text>
        <Text style={{ fontSize: 14, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant }}>
          {t("profile.noGames")}
        </Text>
      </Card>
    );
  }

  return (
    <Card style={{ gap: 16, paddingVertical: 12 }}>
      <ModeStatRow label={`🐣 ${t("profile.aiEasy")}`} stats={modeStats.aiEasy} />
      <View style={{ height: 1, backgroundColor: isDark ? "#2A2A2A" : "#F0ECEC", marginHorizontal: 8 }} />
      <ModeStatRow label={`🦊 ${t("profile.aiMedium")}`} stats={modeStats.aiMedium} />
      <View style={{ height: 1, backgroundColor: isDark ? "#2A2A2A" : "#F0ECEC", marginHorizontal: 8 }} />
      <ModeStatRow label={`🤖 ${t("profile.aiHard")}`} stats={modeStats.aiHard} />
    </Card>
  );
}

function VsFriendsTab({ modeStats }: { modeStats: GameModeStats | null }) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  if (!modeStats || modeStats.friends.gamesPlayed === 0) {
    return (
      <Card style={{ alignItems: "center", paddingVertical: 32 }}>
        <Text style={{ fontSize: 32, marginBottom: 8 }}>👥</Text>
        <Text style={{ fontSize: 14, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant }}>
          {t("profile.noGames")}
        </Text>
      </Card>
    );
  }

  return (
    <Card style={{ gap: 0, paddingVertical: 8, paddingHorizontal: 8 }}>
      <View style={{ flexDirection: "row" }}>
        <StatCell value={`${modeStats.friends.gamesPlayed}`} label={t("profile.gamesPlayed")} />
        <StatCell value={`${modeStats.friends.gamesWon}`} label={t("profile.gamesWon")} />
        <StatCell
          value={`${modeStats.friends.winRate}%`}
          label={t("profile.winRate")}
        />
      </View>
    </Card>
  );
}

/** Shared stats tabs — works for current user (no props) or external player (with props) */
export function ProfileStats({
  externalData,
  externalModeStats,
  showProgress = true,
  activeTab: controlledTab,
  onChangeTab,
}: {
  externalData?: ExternalStats;
  externalModeStats?: GameModeStats | null;
  showProgress?: boolean;
  activeTab?: StatsTab;
  onChangeTab?: (tab: StatsTab) => void;
} = {}) {
  const [internalTab, setInternalTab] = useState<StatsTab>("global");
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = onChangeTab ?? setInternalTab;

  // Current user fallback
  const playerStats = usePlayerStats();
  const currentModeStats = useGameModeStats(playerStats.userId);

  const data: ExternalStats = externalData ?? {
    gamesPlayed: playerStats.stats.gamesPlayed,
    gamesWon: playerStats.stats.gamesWon,
    currentStreak: playerStats.stats.currentStreak,
    bestStreak: playerStats.stats.bestStreak,
    points: playerStats.stats.points,
    winRate: playerStats.winRate,
    level: playerStats.level,
    levelProgress: playerStats.levelProgress,
    xpInLevel: playerStats.xpInLevel,
    xpForNextLevel: playerStats.xpForNextLevel,
  };

  const modeStats = externalModeStats !== undefined ? externalModeStats : currentModeStats;

  return (
    <View>
      <StatsTabBar active={activeTab} onChange={setActiveTab} />
      {activeTab === "global" && <GlobalTab data={data} showProgress={showProgress} />}
      {activeTab === "vsAi" && <VsAiTab modeStats={modeStats} />}
      {activeTab === "vsFriends" && <VsFriendsTab modeStats={modeStats} />}
    </View>
  );
}
