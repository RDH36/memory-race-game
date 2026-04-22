import { Linking, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/ThemeContext";

const LINKS: { url: string; labelKey: string }[] = [
  { url: "https://flipia-landing.vercel.app/privacy", labelKey: "settings.privacy" },
  { url: "https://flipia-landing.vercel.app/terms", labelKey: "settings.terms" },
];

export function LegalLinks() {
  const { t } = useTranslation();
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
        {t("settings.legal")}
      </Text>
      <Text
        style={{
          fontSize: 11,
          fontFamily: "Nunito_400Regular",
          color: colors.onSurfaceMuted,
          marginBottom: 10,
        }}
      >
        {t("settings.legalDesc")}
      </Text>
      <View
        style={{
          backgroundColor: colors.surfaceContainer,
          borderRadius: 16,
          paddingHorizontal: 16,
        }}
      >
        {LINKS.map(({ url, labelKey }, index) => {
          const isLast = index === LINKS.length - 1;
          return (
            <Pressable key={url} onPress={() => Linking.openURL(url)}>
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
                  {t(labelKey)}
                </Text>
                <Text style={{ color: colors.onSurfaceMuted, fontSize: 18 }}>›</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
