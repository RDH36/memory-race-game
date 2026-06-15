import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import { Panel } from "@/components/ui/arcade";
import { useFlag } from "@/lib/analytics";

/** Story card — opens the campaign map. Same card + inner structure
 *  as the featured quest (badged emoji, eyebrow, title, description). */
export function StoryButton() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [base, lip, tint] = colors.hues.gold;
  const campaignOn = useFlag("campaign_enabled");

  const handlePress = () => {
    router.push("/story");
  };

  if (!campaignOn) return null; // remote kill-switch

  return (
    <Panel onPress={handlePress} background={tint} style={{ padding: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 17,
            backgroundColor: base,
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 3px 0 ${lip}`,
          }}
        >
          <Text style={{ fontSize: 30 }}>📖</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 10, letterSpacing: 0.5, color: lip }}>
            {t("home.storyEyebrow").toUpperCase()}
          </Text>
          <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 16, color: colors.onSurface, marginTop: 1 }}>
            {t("home.storyTitle")}
          </Text>
          <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 12, color: colors.onSurfaceMuted, marginTop: 1 }}>
            {t("home.storySubtitle")}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={lip} />
      </View>
    </Panel>
  );
}
