import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { TABLE_SKINS } from "../../lib/skins";
import { OpponentCard, ProgressDots, formatTime } from "../../components/game/PlayerHUD";
import { ActionBar } from "../../components/game/ActionBar";

const TOTAL_PAIRS = 8;

// Mock card states for a mid-game snapshot
type CardState =
  | { kind: "back" }
  | { kind: "face"; emoji: string }
  | { kind: "matched"; emoji: string; player: 1 | 2 };

const MOCK_CARDS: CardState[] = [
  { kind: "matched", emoji: "🐙", player: 1 },
  { kind: "back" },
  { kind: "back" },
  { kind: "matched", emoji: "🦊", player: 2 },
  { kind: "back" },
  { kind: "matched", emoji: "🐙", player: 1 },
  { kind: "face", emoji: "🦄" },
  { kind: "back" },
  { kind: "back" },
  { kind: "back" },
  { kind: "face", emoji: "🦄" },
  { kind: "back" },
  { kind: "back" },
  { kind: "matched", emoji: "🦊", player: 2 },
  { kind: "back" },
  { kind: "back" },
];

/**
 * Static plateau preview — replicates the in-game UI exactly (header back +
 * OpponentCard + score row + 4×4 grid + ActionBar + Player bar).
 *
 * V1: route param `id` is ignored — plateau-specific theming isn't applied
 * in-game yet, so all previews render the same UI. Once GameGrid supports
 * per-plateau colors, switch on `id` here to mirror.
 */
export default function PlateauPreviewScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { avatar, nickname, selectedTable } = usePlayerStats();
  const table = TABLE_SKINS.find((t) => t.id === selectedTable) ?? TABLE_SKINS[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Header — back + title centered */}
      <View style={{ flexDirection: "row", alignItems: "center", height: 56, paddingTop: 8, paddingHorizontal: 16, paddingBottom: 4 }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: colors.surfaceContainer,
            alignItems: "center", justifyContent: "center",
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={{
          flex: 1, textAlign: "center",
          fontFamily: "Fredoka_700Bold", fontSize: 20,
          color: colors.onSurface, letterSpacing: -0.3,
        }}>
          {t("apparence.previewTitle", "Aperçu")} — {table.name}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 }}>

        {/* Opponent card */}
        <OpponentCard
          name="BabyBot"
          subtitle={`🤖 ${t("game.ia")} · ${t("home.difficulty.medium")}`}
          avatar="🐣"
          pairsMatched={2}
          totalPairs={TOTAL_PAIRS}
          isActive={false}
          timerSeconds={0}
        />

        {/* Score */}
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "center", marginVertical: 8 }}>
          <Text style={{ fontSize: 11, fontFamily: "Nunito_700Bold", color: colors.onSurfaceVariant, letterSpacing: 1, marginRight: 8 }}>
            {t("game.pairs")}
          </Text>
          <Text style={{ fontSize: 18, fontFamily: "Fredoka_700Bold", color: colors.p1 }}>2</Text>
          <Text style={{ fontSize: 14, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginHorizontal: 6 }}>—</Text>
          <Text style={{ fontSize: 18, fontFamily: "Fredoka_700Bold", color: colors.p2 }}>2</Text>
          <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginLeft: 4 }}>
            / {TOTAL_PAIRS}
          </Text>
        </View>

        {/* Mock grid 4×4 — same look as in-game CardItem */}
        <View style={{ flex: 1, justifyContent: "center" }}>
          <View style={{ gap: 8 }}>
            {[0, 1, 2, 3].map((row) => (
              <View key={row} style={{ flexDirection: "row", gap: 8 }}>
                {[0, 1, 2, 3].map((col) => {
                  const card = MOCK_CARDS[row * 4 + col];
                  return <PreviewCard key={col} card={card} />;
                })}
              </View>
            ))}
          </View>
        </View>

        {/* Tornado action bar */}
        <ActionBar canUseTornado={false} tornadoUsed={false} onTornado={() => {}} />

        {/* Player bar */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, gap: 10 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: colors.primaryContainerBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 18 }}>{avatar}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontFamily: "Fredoka_600SemiBold", color: colors.onSurface }}>
              {nickname || t("game.you")}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={{ fontSize: 11, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant }}>
                {t("game.player")}
              </Text>
              <Text style={{ fontSize: 11 }}>🌪️</Text>
            </View>
          </View>
          <ProgressDots filled={2} total={TOTAL_PAIRS} />
          <View
            style={{
              backgroundColor: isDark ? "#2A2A2A" : "#F5F2F2",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Fredoka_600SemiBold",
                color: colors.onSurfaceVariant,
              }}
            >
              {formatTime(0)}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function PreviewCard({ card }: { card: CardState }) {
  const { colors } = useTheme();

  if (card.kind === "back") {
    return (
      <View
        style={{
          flex: 1,
          aspectRatio: 1,
          borderRadius: 8,
          backgroundColor: colors.p1Bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 24, fontFamily: "Fredoka_700Bold", color: colors.p1 }}>?</Text>
      </View>
    );
  }

  if (card.kind === "matched") {
    const bg = card.player === 1 ? colors.p1Bg : colors.p2Bg;
    const ring = card.player === 1 ? colors.p1 + "33" : colors.p2 + "33";
    return (
      <View
        style={{
          flex: 1,
          aspectRatio: 1,
          borderRadius: 8,
          backgroundColor: bg,
          borderWidth: 1.5,
          borderColor: ring,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 28 }}>{card.emoji}</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        aspectRatio: 1,
        borderRadius: 8,
        backgroundColor: colors.surfaceContainer,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 28 }}>{card.emoji}</Text>
    </View>
  );
}
