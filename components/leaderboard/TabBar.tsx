import { Pressable, Text, View } from "react-native";

export type TabKey = "xp" | "rank";

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
    { key: "rank", label: t("leaderboard.tabRank"), disabled: true },
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: colors.surfaceContainer,
        borderRadius: 16,
        padding: 5,
        gap: 4,
        boxShadow: `0 3px 0 ${colors.panelLip}, 0 10px 22px -14px ${colors.panelShadow}`,
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
              paddingVertical: 9,
              borderRadius: 13,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isActive ? colors.primary : "transparent",
              boxShadow: isActive ? `0 3px 0 ${colors.hues.violet[1]}` : undefined,
              opacity: tab.disabled ? 0.4 : 1,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Fredoka_700Bold",
                color: isActive ? "#fff" : colors.onSurfaceMuted,
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
