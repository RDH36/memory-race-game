import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { LANGUAGES, setLanguage } from "../../i18n";
import { useTheme } from "../../lib/ThemeContext";

export function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();

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
        {t("settings.language")}
      </Text>
      <Text
        style={{
          fontSize: 11,
          fontFamily: "Nunito_400Regular",
          color: colors.onSurfaceMuted,
          marginBottom: 10,
        }}
      >
        {t("settings.languageDesc")}
      </Text>
      <View
        style={{
          backgroundColor: colors.surfaceContainer,
          borderRadius: 16,
          paddingHorizontal: 16,
        }}
      >
        {LANGUAGES.map(({ code, label }, index) => {
          const isActive = i18n.language === code;
          const isLast = index === LANGUAGES.length - 1;
          return (
            <Pressable key={code} onPress={() => setLanguage(code)}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 14,
                  borderBottomWidth: isLast ? 0 : 1,
                  borderBottomColor: colors.ghostBorder,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: "Nunito_600SemiBold",
                    color: colors.onSurface,
                  }}
                >
                  {label}
                </Text>
                {isActive && (
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: colors.primaryContainer,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#FFF", fontSize: 13, fontFamily: "Nunito_700Bold" }}>
                      ✓
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
