import { Linking, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../ui/Card";
import { Label } from "../ui/Label";
import { useTheme } from "../../lib/ThemeContext";

const LINKS: { url: string; icon: keyof typeof Ionicons.glyphMap; labelKey: string }[] = [
  { url: "https://flipia-landing.vercel.app/privacy", icon: "shield-checkmark-outline", labelKey: "settings.privacy" },
  { url: "https://flipia-landing.vercel.app/terms", icon: "document-text-outline", labelKey: "settings.terms" },
];

export function LegalLinks() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View>
      <Label text={t("settings.legal")} />
      <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginBottom: 12, marginTop: -4 }}>
        {t("settings.legalDesc")}
      </Text>
      <View style={{ gap: 8 }}>
        {LINKS.map(({ url, icon, labelKey }) => (
          <Pressable
            key={url}
            onPress={() => Linking.openURL(url)}
            style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
          >
            <Card
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                backgroundColor: colors.surfaceContainer,
              }}
            >
              <Ionicons name={icon} size={22} color={colors.onSurfaceVariant} />
              <Text
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontFamily: "Nunito_600SemiBold",
                  color: colors.onSurface,
                }}
              >
                {t(labelKey)}
              </Text>
              <Ionicons name="open-outline" size={18} color={colors.onSurfaceVariant} />
            </Card>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
