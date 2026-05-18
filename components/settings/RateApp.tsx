import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/ThemeContext";
import { openStoreReview } from "../../lib/storeReview";

export function RateApp() {
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
        {t("settings.rate")}
      </Text>
      <Text
        style={{
          fontSize: 11,
          fontFamily: "Nunito_400Regular",
          color: colors.onSurfaceMuted,
          marginBottom: 10,
        }}
      >
        {t("settings.rateDesc")}
      </Text>
      <Pressable onPress={openStoreReview}>
        <View
          style={{
            backgroundColor: colors.surfaceContainer,
            borderRadius: 16,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 14,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={{ fontSize: 18 }}>⭐</Text>
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Nunito_600SemiBold",
                color: colors.onSurface,
              }}
            >
              {t("settings.rateAction")}
            </Text>
          </View>
          <Text style={{ color: colors.onSurfaceMuted, fontSize: 18 }}>›</Text>
        </View>
      </Pressable>
    </View>
  );
}
