import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme, type ThemeMode } from "../../lib/ThemeContext";

const THEME_OPTIONS: { mode: ThemeMode; icon: string; labelKey: string }[] = [
  { mode: "light", icon: "☀", labelKey: "settings.themeLight" },
  { mode: "dark", icon: "☾", labelKey: "settings.themeDark" },
  { mode: "system", icon: "◐", labelKey: "settings.themeSystem" },
];

export function ThemeSelector() {
  const { t } = useTranslation();
  const { colors, themeMode, setThemeMode } = useTheme();

  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Nunito_700Bold",
          color: colors.onSurfaceMuted,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {t("settings.theme")}
      </Text>
      <Text
        style={{
          fontSize: 11,
          fontFamily: "Nunito_400Regular",
          color: colors.onSurfaceMuted,
          marginBottom: 10,
        }}
      >
        {t("settings.themeDesc")}
      </Text>
      <View
        style={{
          backgroundColor: colors.surfaceContainer,
          borderRadius: 16,
          padding: 10,
          flexDirection: "row",
        }}
      >
        {THEME_OPTIONS.map(({ mode, icon, labelKey }, index) => {
          const isActive = themeMode === mode;
          const isLast = index === THEME_OPTIONS.length - 1;
          return (
            <View
              key={mode}
              style={{
                flex: 1,
                marginRight: isLast ? 0 : 8,
              }}
            >
              <Pressable
                onPress={() => setThemeMode(mode)}
                style={{
                  backgroundColor: isActive ? colors.primaryContainer : colors.surfaceContainerLow,
                  borderRadius: 14,
                  paddingVertical: 18,
                  paddingHorizontal: 8,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    color: isActive ? "#FFF" : colors.onSurface,
                    marginBottom: 6,
                  }}
                >
                  {icon}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Nunito_600SemiBold",
                    color: isActive ? "#FFF" : colors.onSurface,
                  }}
                >
                  {t(labelKey)}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
