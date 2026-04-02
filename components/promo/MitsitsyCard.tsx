import { Image, Linking, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/ThemeContext";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.rdh36.moneytracking";

export function MitsitsyCard() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={() => Linking.openURL(PLAY_STORE_URL)}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View
        style={{
          backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: isDark ? "#333" : "#E8E4E4",
          flexDirection: "row",
          alignItems: "center",
          padding: 14,
          gap: 14,
        }}
      >
        <Image
          source={require("../../assets/mitsitsy.png")}
          style={{ width: 48, height: 48, borderRadius: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Nunito_700Bold",
              color: colors.onSurface,
            }}
            numberOfLines={1}
          >
            Mitsitsy
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Nunito_400Regular",
              color: colors.onSurfaceVariant,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {t("promo.mitsitsy")}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "#38BDB2",
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 8,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Fredoka_600SemiBold",
              color: "#FFF",
            }}
          >
            {t("promo.download")}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
