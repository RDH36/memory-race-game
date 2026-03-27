import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { LANGUAGES, setLanguage } from "../../i18n";
import { Card } from "../ui/Card";
import { Label } from "../ui/Label";
import { useTheme } from "../../lib/ThemeContext";

export function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();

  return (
    <View>
      <Label text={t("settings.language")} />
      <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginBottom: 12, marginTop: -4 }}>
        {t("settings.languageDesc")}
      </Text>
      <View style={{ gap: 8 }}>
        {LANGUAGES.map(({ code, label, flag }) => {
          const isActive = i18n.language === code;
          return (
            <Pressable
              key={code}
              onPress={() => setLanguage(code)}
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
                <Text style={{ fontSize: 24 }}>{flag}</Text>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 15,
                    fontFamily: isActive ? "Nunito_700Bold" : "Nunito_600SemiBold",
                    color: isActive ? colors.primaryContainer : colors.onSurface,
                  }}
                >
                  {label}
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
