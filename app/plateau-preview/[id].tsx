import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { TABLE_SKINS, getCardSkin } from "../../lib/skins";
import { OpponentCard, ProgressDots, formatTime } from "../../components/game/PlayerHUD";
import { ActionBar } from "../../components/game/ActionBar";
import { RoyalBoardBackground } from "../../components/game/royal/RoyalBoardBackground";
import { RoyalCardVisual } from "../../components/game/royal/RoyalCardVisual";
import { InfernoBoardBackground } from "../../components/game/inferno/InfernoBoardBackground";
import { InfernoCardVisual } from "../../components/game/inferno/InfernoCardVisual";
import { HeavenBoardBackground } from "../../components/game/heaven/HeavenBoardBackground";
import { HeavenCardVisual } from "../../components/game/heaven/HeavenCardVisual";

const TOTAL_PAIRS = 8;

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
 * Static plateau preview — replicates the in-game UI exactly. The route param
 * `id` selects which plateau theme to render (currently "premium" → Royal V2).
 */
export default function PlateauPreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { avatar, nickname } = usePlayerStats();

  const table = TABLE_SKINS.find((tbl) => tbl.id === id) ?? TABLE_SKINS[0];
  const skin = getCardSkin(table.id);

  const grid = (
    <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 12, paddingVertical: 12 }}>
      <View style={{ gap: 8 }}>
        {[0, 1, 2, 3].map((row) => (
          <View key={row} style={{ flexDirection: "row", gap: 8 }}>
            {[0, 1, 2, 3].map((col) => {
              const card = MOCK_CARDS[row * 4 + col];
              return (
                <View key={col} style={{ flex: 1, aspectRatio: 1 }}>
                  {skin === "royal" ? (
                    <RoyalPreviewCard card={card} />
                  ) : skin === "inferno" ? (
                    <InfernoPreviewCard card={card} />
                  ) : skin === "heaven" ? (
                    <HeavenPreviewCard card={card} />
                  ) : (
                    <ClassicPreviewCard card={card} />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
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
        <OpponentCard
          name="BabyBot"
          subtitle={`🤖 ${t("game.ia")} · ${t("home.difficulty.medium")}`}
          avatar="🐣"
          pairsMatched={2}
          totalPairs={TOTAL_PAIRS}
          isActive={false}
          timerSeconds={0}
        />

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

        <View style={{ flex: 1 }}>
          {skin === "royal" ? (
            <RoyalBoardBackground>{grid}</RoyalBoardBackground>
          ) : skin === "inferno" ? (
            <InfernoBoardBackground>{grid}</InfernoBoardBackground>
          ) : skin === "heaven" ? (
            <HeavenBoardBackground>{grid}</HeavenBoardBackground>
          ) : (
            grid
          )}
        </View>

        <ActionBar canUseTornado={false} tornadoUsed={false} onTornado={() => {}} />

        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, gap: 10 }}>
          <View
            style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: colors.primaryContainerBg,
              alignItems: "center", justifyContent: "center",
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
              paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 14, fontFamily: "Fredoka_600SemiBold", color: colors.onSurfaceVariant }}>
              {formatTime(0)}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function RoyalPreviewCard({ card }: { card: CardState }) {
  if (card.kind === "back") return <RoyalCardVisual state="back" fillParent />;
  if (card.kind === "matched") {
    return <RoyalCardVisual state="matched" emoji={card.emoji} player={card.player} fillParent />;
  }
  return <RoyalCardVisual state="face" emoji={card.emoji} fillParent />;
}

function InfernoPreviewCard({ card }: { card: CardState }) {
  if (card.kind === "back") return <InfernoCardVisual state="back" fillParent />;
  if (card.kind === "matched") {
    return <InfernoCardVisual state="matched" emoji={card.emoji} player={card.player} fillParent />;
  }
  return <InfernoCardVisual state="face" emoji={card.emoji} fillParent />;
}

function HeavenPreviewCard({ card }: { card: CardState }) {
  if (card.kind === "back") return <HeavenCardVisual state="back" fillParent />;
  if (card.kind === "matched") {
    return <HeavenCardVisual state="matched" emoji={card.emoji} player={card.player} fillParent />;
  }
  return <HeavenCardVisual state="face" emoji={card.emoji} fillParent />;
}

function ClassicPreviewCard({ card }: { card: CardState }) {
  const { colors } = useTheme();

  if (card.kind === "back") {
    return (
      <View
        style={{
          flex: 1, aspectRatio: 1, borderRadius: 8,
          backgroundColor: colors.p1Bg,
          alignItems: "center", justifyContent: "center",
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
          flex: 1, aspectRatio: 1, borderRadius: 8,
          backgroundColor: bg, borderWidth: 1.5, borderColor: ring,
          alignItems: "center", justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 28 }}>{card.emoji}</Text>
      </View>
    );
  }
  return (
    <View
      style={{
        flex: 1, aspectRatio: 1, borderRadius: 8,
        backgroundColor: colors.surfaceContainer,
        alignItems: "center", justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 28 }}>{card.emoji}</Text>
    </View>
  );
}
