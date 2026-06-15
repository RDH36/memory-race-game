// Memory-healing solo grid — the real game cards (flip animation, sounds,
// player's table skin), with a mistake budget: more than 3 misses = failed.
import { useRef, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { CardItem } from "@/components/game/CardItem";
import { MAX_MISTAKES, MistakeHearts } from "@/components/story/lives";
import { playFlip, playMatch } from "@/lib/sound";
import { haptics } from "@/lib/haptics";
import { getCardSkin } from "@/lib/skins";
import { usePlayerStats } from "@/lib/playerStats";

const COLS = 3;

function shuffledDeck(emojis: string[]): string[] {
  const deck = [...emojis, ...emojis];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function HealingGrid({
  cardEmojis,
  resetNonce,
  freeMode = false,
  onWin,
  onFail,
}: {
  /** One emoji per pair. */
  cardEmojis: string[];
  /** Bump to reshuffle and restart the grid (retry). */
  resetNonce: number;
  /** Replay mode: no mistake budget — re-reading a cleared step is free. */
  freeMode?: boolean;
  onWin: () => void;
  onFail: () => void;
}) {
  const { width } = useWindowDimensions();
  const { selectedTable } = usePlayerStats();
  const skin = getCardSkin(selectedTable);

  const [deck, setDeck] = useState(() => shuffledDeck(cardEmojis));
  const [matched, setMatched] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [justMatched, setJustMatched] = useState<number[]>([]);
  const [justMismatched, setJustMismatched] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [nonce, setNonce] = useState(resetNonce);
  const lock = useRef(false);

  // Retry: reshuffle and clear all state (render-time reset, no effect).
  if (nonce !== resetNonce) {
    setNonce(resetNonce);
    setDeck(shuffledDeck(cardEmojis));
    setMatched([]);
    setSelected([]);
    setJustMatched([]);
    setJustMismatched([]);
    setMistakes(0);
    lock.current = false;
  }

  const handlePress = (cardId: number) => {
    if (lock.current || matched.includes(cardId) || selected.includes(cardId)) return;
    playFlip();
    haptics.tap();
    const next = [...selected, cardId];
    setSelected(next);
    if (next.length < 2) return;

    lock.current = true;
    const [a, b] = next;
    if (deck[a] === deck[b]) {
      playMatch();
      haptics.go();
      const all = [...matched, a, b];
      setMatched(all);
      setJustMatched([a, b]);
      setSelected([]);
      lock.current = false;
      if (all.length === deck.length) setTimeout(onWin, 450);
    } else {
      setJustMismatched([a, b]);
      const failed = !freeMode && mistakes + 1 > MAX_MISTAKES;
      setTimeout(() => {
        setSelected([]);
        setJustMismatched([]);
        setMistakes(mistakes + 1);
        lock.current = false;
        if (failed) onFail();
      }, 850);
    }
  };

  const cardSize = Math.min(100, (width - 40 - (COLS - 1) * 12) / COLS);

  return (
    <View style={{ alignItems: "center", gap: 14 }}>
      {!freeMode && <MistakeHearts mistakes={mistakes} />}

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "center",
          maxWidth: COLS * (cardSize + 12),
        }}
      >
        {deck.map((emoji, id) => (
          <View key={`${nonce}-${id}`} style={{ width: cardSize, height: cardSize }}>
            <CardItem
              cardId={id}
              emoji={emoji}
              isFaceUp={matched.includes(id) || selected.includes(id)}
              matchedBy={matched.includes(id) ? 1 : -1}
              isJustMatched={justMatched.includes(id)}
              isJustMismatched={justMismatched.includes(id)}
              onPress={handlePress}
              disabled={lock.current}
              skin={skin}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
