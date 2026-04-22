import { Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/ThemeContext";

export function ModeBackButton() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={16}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: colors.surfaceContainer,
        alignSelf: "flex-start",
        marginBottom: 20,
      }}
    >
      <Text style={{ fontSize: 18, color: colors.onSurfaceVariant, marginRight: 4 }}>←</Text>
      <Text
        style={{
          fontSize: 14,
          fontFamily: "Nunito_600SemiBold",
          color: colors.onSurfaceVariant,
        }}
      >
        {t("game.menu")}
      </Text>
    </Pressable>
  );
}
