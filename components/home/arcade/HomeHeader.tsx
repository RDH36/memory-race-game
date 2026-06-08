import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/lib/ThemeContext";
import { usePlayerStats } from "@/lib/playerStats";
import { useTranslation } from "react-i18next";
import { Avatar, CoinBar, Rise } from "@/components/ui/arcade";
import { haptics } from "@/lib/haptics";

export function HomeHeader() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { avatar, nickname, level, stats } = usePlayerStats();

  return (
    <Rise>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <Pressable
          onPress={() => {
            haptics.select();
            router.push("/profile");
          }}
          style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
        >
          <Avatar emoji={avatar} size={46} />
          <View>
            <Text
              style={{ fontFamily: "Fredoka_700Bold", fontSize: 16, color: colors.onSurface }}
            >
              {nickname || t("home.welcome")}
            </Text>
            <Text
              style={{
                fontFamily: "Fredoka_700Bold",
                fontSize: 11,
                color: colors.onSurfaceMuted,
                marginTop: 2,
              }}
            >
              {t("profile.level", { level })}
            </Text>
          </View>
        </Pressable>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <CoinBar icon="⚡" value={stats.points} color="gold" />
          <CoinBar icon="🔥" value={stats.currentStreak} color="blue" />
        </View>
      </View>
    </Rise>
  );
}
