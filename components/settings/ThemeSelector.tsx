import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Card } from "../ui/Card";
import { Label } from "../ui/Label";
import { useTheme, type ThemeMode } from "../../lib/ThemeContext";

const THEME_OPTIONS: { mode: ThemeMode; icon: string; labelKey: string }[] = [
  { mode: "system", icon: "📱", labelKey: "settings.themeSystem" },
  { mode: "light", icon: "☀️", labelKey: "settings.themeLight" },
  { mode: "dark", icon: "🌙", labelKey: "settings.themeDark" },
];

export function ThemeSelector() {
  const { t } = useTranslation();
  const { colors, themeMode, setThemeMode } = useTheme();

  return (
    <View>
      <Label text={t("settings.theme")} />
      <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginBottom: 12, marginTop: -4 }}>
        {t("settings.themeDesc")}
      </Text>
      <View style={{ gap: 8 }}>
        {THEME_OPTIONS.map(({ mode, icon, labelKey }) => {
          const isActive = themeMode === mode;
          return (
            <Pressable
              key={mode}
              onPress={() => setThemeMode(mode)}
              style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
            >
              <Card
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: isActive ? colors.primaryContainerBg : colors.surfaceContainer,
                }}
              >
                <Text style={{ fontSize: 24 }}>{icon}</Text>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 15,
                    fontFamily: isActive ? "Nunito_700Bold" : "Nunito_600SemiBold",
                    color: isActive ? colors.primaryContainer : colors.onSurface,
                  }}
                >
                  {t(labelKey)}
                </Text>
                {isActive && (
                  <Text style={{ fontSize: 16, color: colors.primaryContainer }}>✓</Text>
                )}
              </Card>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
