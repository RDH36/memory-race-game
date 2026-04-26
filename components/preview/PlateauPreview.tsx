import { Text, View } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { type CardSkin } from "../../lib/skins";
import { RoyalBoardBackground } from "../game/royal/RoyalBoardBackground";
import { RoyalCardVisual } from "../game/royal/RoyalCardVisual";
import { InfernoBoardBackground } from "../game/inferno/InfernoBoardBackground";
import { InfernoCardVisual } from "../game/inferno/InfernoCardVisual";
import { HeavenBoardBackground } from "../game/heaven/HeavenBoardBackground";
import { HeavenCardVisual } from "../game/heaven/HeavenCardVisual";

export type PreviewCard =
  | { kind: "back" }
  | { kind: "face"; emoji: string }
  | { kind: "matched"; emoji: string; player: 1 | 2 };

const DEFAULT_CARDS: PreviewCard[] = [
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

interface Props {
  skin: CardSkin;
  cards?: PreviewCard[];
}

/**
 * 4×4 plateau preview using the actual in-game `*BoardBackground` chrome
 * + per-skin card visuals. Same MOCK pattern as `app/plateau-preview/[id].tsx`.
 */
export function PlateauPreview({ skin, cards = DEFAULT_CARDS }: Props) {
  const grid = (
    <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 12, paddingVertical: 12 }}>
      <View style={{ gap: 8 }}>
        {[0, 1, 2, 3].map((row) => (
          <View key={row} style={{ flexDirection: "row", gap: 8 }}>
            {[0, 1, 2, 3].map((col) => {
              const card = cards[row * 4 + col];
              return (
                <View key={col} style={{ flex: 1, aspectRatio: 1 }}>
                  <PreviewCardView skin={skin} card={card} />
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );

  if (skin === "royal") return <RoyalBoardBackground>{grid}</RoyalBoardBackground>;
  if (skin === "inferno") return <InfernoBoardBackground>{grid}</InfernoBoardBackground>;
  if (skin === "heaven") return <HeavenBoardBackground>{grid}</HeavenBoardBackground>;
  return grid;
}

function PreviewCardView({ skin, card }: { skin: CardSkin; card: PreviewCard }) {
  if (skin === "royal") {
    if (card.kind === "back") return <RoyalCardVisual state="back" fillParent />;
    if (card.kind === "matched")
      return <RoyalCardVisual state="matched" emoji={card.emoji} player={card.player} fillParent />;
    return <RoyalCardVisual state="face" emoji={card.emoji} fillParent />;
  }
  if (skin === "inferno") {
    if (card.kind === "back") return <InfernoCardVisual state="back" fillParent />;
    if (card.kind === "matched")
      return <InfernoCardVisual state="matched" emoji={card.emoji} player={card.player} fillParent />;
    return <InfernoCardVisual state="face" emoji={card.emoji} fillParent />;
  }
  if (skin === "heaven") {
    if (card.kind === "back") return <HeavenCardVisual state="back" fillParent />;
    if (card.kind === "matched")
      return <HeavenCardVisual state="matched" emoji={card.emoji} player={card.player} fillParent />;
    return <HeavenCardVisual state="face" emoji={card.emoji} fillParent />;
  }
  return <ClassicPreviewCard card={card} />;
}

function ClassicPreviewCard({ card }: { card: PreviewCard }) {
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
