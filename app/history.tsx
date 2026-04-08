import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../lib/ThemeContext";
import { usePlayerStats } from "../lib/playerStats";
import { useMatchHistory, type MatchEntry } from "../lib/matchHistory";
import { MatchRow } from "../components/history/MatchRow";

export default function HistoryScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { userId } = usePlayerStats();
  const { matches, isLoading } = useMatchHistory(userId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={["top"]}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: colors.surfaceContainer,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.onSurfaceVariant} />
        </Pressable>
        <Text style={{ fontSize: 28, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
          {t("history.title")}
        </Text>
      </View>

      <FlatList<MatchEntry>
        data={matches}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MatchRow match={item} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 10 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 80 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📭</Text>
            <Text style={{ fontSize: 15, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant }}>
              {isLoading ? t("history.loading") : t("history.empty")}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
