import { Pressable, Text, View } from "react-native";

export type TabKey = "winRate" | "xp" | "rank";

export function TabBar({
  activeTab,
  onChangeTab,
  colors,
  isDark,
  t,
}: {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
  colors: any;
  isDark: boolean;
  t: any;
}) {
  const tabs: { key: TabKey; label: string; disabled?: boolean }[] = [
    { key: "xp", label: t("leaderboard.tabXp") },
    { key: "winRate", label: t("leaderboard.tabWinRate") },
    { key: "rank", label: t("leaderboard.tabRank"), disabled: true },
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        marginHorizontal: 20,
        marginBottom: 12,
        backgroundColor: isDark ? "#1E1E1E" : "#F0ECEC",
        borderRadius: 12,
        padding: 4,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => !tab.disabled && onChangeTab(tab.key)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isActive ? colors.surface : "transparent",
              opacity: tab.disabled ? 0.4 : 1,
              shadowColor: isActive ? "#000" : "transparent",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isActive ? 0.08 : 0,
              shadowRadius: 2,
              elevation: isActive ? 2 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontFamily: isActive
                  ? "Nunito_700Bold"
                  : "Nunito_600SemiBold",
                color: isActive ? colors.onSurface : colors.onSurfaceVariant,
              }}
            >
              {tab.label}
            </Text>
            {tab.disabled && (
              <Text
                style={{
                  fontSize: 8,
                  fontFamily: "Nunito_700Bold",
                  color: colors.onSurfaceVariant,
                  marginTop: 1,
                }}
              >
                {t("leaderboard.comingSoon").toUpperCase()}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
