import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import { CoinBar } from "@/components/ui/arcade";

export function BuildsHeader({ gold }: { gold: number }) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 20,
      }}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ fontSize: 28, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
          {t("builds.title")}
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontFamily: "Nunito_400Regular",
            color: colors.onSurfaceVariant,
            marginTop: 2,
          }}
        >
          {t("builds.subtitle")}
        </Text>
      </View>
      <View style={{ marginTop: 4 }}>
        <CoinBar icon="🪙" value={gold} color="gold" />
      </View>
    </View>
  );
}
