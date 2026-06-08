import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { MatchResult } from "@/hooks/useLocalGame";

export type Chatter = { who: 1 | 2; text: string } | null;

type Tone =
  | "cute"
  | "sly"
  | "fierce"
  | "robot"
  | "zen"
  | "crown"
  | "angel"
  | "demon"
  | "default";

// Each avatar speaks with its own temperament. Premium avatars (👑👼😈)
// get their own unique voice.
const TONE_BY_EMOJI: Record<string, Tone> = {
  "🐣": "cute", "🐼": "cute", "🐨": "cute", "🐸": "cute", "🐝": "cute",
  "🦄": "cute", "🦩": "cute", "🦋": "cute",
  "🦊": "sly", "🐙": "sly", "🐵": "sly",
  "🐯": "fierce", "🦁": "fierce", "🐺": "fierce", "🦈": "fierce", "🦅": "fierce",
  "🤖": "robot",
  "🦉": "zen", "🐳": "zen", "🐻": "zen", "🧠": "zen",
  "👑": "crown",
  "👼": "angel",
  "😈": "demon",
};

function toneOf(emoji: string): Tone {
  return TONE_BY_EMOJI[emoji] ?? "default";
}

function pick(arr: unknown): string {
  if (Array.isArray(arr) && arr.length > 0) {
    return String(arr[Math.floor(Math.random() * arr.length)]);
  }
  return "";
}

type Opts = {
  lastMatchResult: MatchResult;
  currentTurn: 1 | 2;
  status: string;
  /** Which game-player number is the local user (online guest = 2). */
  meIsPlayer?: 1 | 2;
  playerAvatar: string;
  opponentAvatar: string;
};

/**
 * Drives the fighters' speech bubbles — each avatar reacts & encourages with
 * its own personality (tone). `who` is relative to the local player:
 * 1 = me (left), 2 = opponent (right).
 */
export function useGameChatter({
  lastMatchResult,
  currentTurn,
  status,
  meIsPlayer = 1,
  playerAvatar,
  opponentAvatar,
}: Opts): Chatter {
  const { t } = useTranslation();
  const [chatter, setChatter] = useState<Chatter>(null);

  const lineFor = (who: 1 | 2, event: "match" | "miss" | "encourage") => {
    const tone = toneOf(who === 1 ? playerAvatar : opponentAvatar);
    return pick(t(`game.personas.${tone}.${event}`, { returnObjects: true }));
  };

  // Reaction to a match / miss.
  useEffect(() => {
    if (!lastMatchResult) return;
    const { type, player } = lastMatchResult;
    const who: 1 | 2 = player === meIsPlayer ? 1 : 2;
    const text = lineFor(who, type === "match" ? "match" : "miss");
    if (!text) return;
    setChatter({ who, text });
    const id = setTimeout(() => setChatter(null), 1800);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMatchResult]);

  // Turn-start encouragement (only when no reaction is showing).
  useEffect(() => {
    if (status !== "playing") return;
    const who: 1 | 2 = currentTurn === meIsPlayer ? 1 : 2;
    const id = setTimeout(() => {
      setChatter((current) => {
        if (current) return current;
        const text = lineFor(who, "encourage");
        return text ? { who, text } : null;
      });
    }, 450);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTurn, status]);

  return chatter;
}
