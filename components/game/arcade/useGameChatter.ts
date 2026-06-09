import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { MatchResult } from "@/hooks/useLocalGame";

export type ChatterKind = "match" | "miss" | "encourage" | "clash";
export type Chatter = { who: 1 | 2; text: string; kind: ChatterKind } | null;

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
  "🦄": "cute", "🦩": "cute", "🦋": "cute", "🐶": "cute", "🐰": "cute",
  "🐧": "cute", "🐹": "cute", "🐞": "cute",
  "🦊": "sly", "🐙": "sly", "🐵": "sly", "🐱": "sly", "🦜": "sly",
  "🦎": "sly", "🦝": "sly",
  "🐯": "fierce", "🦁": "fierce", "🐺": "fierce", "🦈": "fierce", "🦅": "fierce",
  "🐲": "fierce", "🦧": "fierce", "🐊": "fierce",
  "🤖": "robot",
  "🦉": "zen", "🐳": "zen", "🐻": "zen", "🧠": "zen", "🦥": "zen",
  "👑": "crown",
  "👼": "angel",
  "😈": "demon",
};

// Emoji → i18n animal name key (under `avatars.*`), for clash banter ({opp}).
const NAME_KEY_BY_EMOJI: Record<string, string> = {
  "🧠": "brain", "🦊": "fox", "🐙": "octopus", "🦉": "owl", "🐼": "panda",
  "🦁": "lion", "🐯": "tiger", "🦄": "unicorn", "🐺": "wolf", "🦅": "eagle",
  "🐸": "frog", "🦋": "butterfly", "🐝": "bee", "🦈": "shark", "🐳": "whale",
  "🦩": "flamingo", "👑": "crown", "👼": "angel", "😈": "demon",
  "🐶": "dog", "🐱": "cat", "🐰": "rabbit", "🐨": "koala", "🐵": "monkey",
  "🐻": "bear", "🐧": "penguin", "🐹": "hamster", "🦜": "parrot", "🐲": "dragon",
  "🦎": "lizard", "🦝": "raccoon", "🐞": "ladybug", "🦧": "ape", "🐊": "croc",
  "🦥": "sloth", "🐣": "chick", "🤖": "robot",
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
  /** Player display names — used to call out their player when encouraging. */
  playerName?: string;
  opponentName?: string;
};

/**
 * Drives the fighters' speech bubbles — each avatar reacts & encourages with
 * its own personality (tone). `who` is relative to the local player:
 * 1 = me (left), 2 = opponent (right).
 */
export function useGameChatter({
  lastMatchResult,
  status,
  meIsPlayer = 1,
  playerAvatar,
  opponentAvatar,
  playerName,
  opponentName,
}: Opts): Chatter {
  const { t } = useTranslation();
  const [chatter, setChatter] = useState<Chatter>(null);
  const clearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animalOf = (emoji: string) => {
    const key = NAME_KEY_BY_EMOJI[emoji];
    return key ? t(`avatars.${key}`) : "";
  };

  const lineFor = (who: 1 | 2, event: ChatterKind) => {
    const tone = toneOf(who === 1 ? playerAvatar : opponentAvatar);
    let line = pick(t(`game.personas.${tone}.${event}`, { returnObjects: true }));
    if (!line) return "";
    // {name} = the speaker's own player (encouragement calls them by name).
    if (line.includes("{name}")) {
      const name = (who === 1 ? playerName : opponentName) || "";
      line = line.replace(/\{name\}/g, name);
    }
    // {opp} = the OTHER avatar's animal (clash addresses the rival).
    if (line.includes("{opp}")) {
      const oppEmoji = who === 1 ? opponentAvatar : playerAvatar;
      const opp = animalOf(oppEmoji).toLowerCase();
      line = line.replace(/\{opp\}/g, opp);
    }
    return line.replace(/\s+/g, " ").trim();
  };

  const say = (who: 1 | 2, kind: ChatterKind, duration: number): boolean => {
    const text = lineFor(who, kind);
    if (!text) return false;
    if (clearRef.current) clearTimeout(clearRef.current);
    setChatter({ who, text, kind });
    clearRef.current = setTimeout(() => setChatter(null), duration);
    return true;
  };

  // Event-driven banter: react to actual game actions (a pair found / missed),
  // never on a constant timer. A cooldown + random skips keep it SPARSE so the
  // avatars stay quiet most of the time instead of chattering non-stop.
  const lastSpokeRef = useRef(0);
  const COOLDOWN = 2500; // min ms of silence between bubbles
  const SPEAK_CHANCE = 0.8; // most eligible actions trigger a line

  useEffect(() => {
    if (!lastMatchResult || status !== "playing") return;
    const now = Date.now();
    if (now - lastSpokeRef.current < COOLDOWN) return; // still cooling down → silence
    if (Math.random() > SPEAK_CHANCE) return; // randomly stay quiet

    const { type, player } = lastMatchResult;
    const actor: 1 | 2 = player === meIsPlayer ? 1 : 2; // who just played
    const other: 1 | 2 = actor === 1 ? 2 : 1;

    let who: 1 | 2;
    let kind: ChatterKind;
    if (type === "match") {
      // The scorer reacts to taking the point — mostly taunts the rival.
      who = actor;
      kind = Math.random() < 0.7 ? "clash" : "match";
    } else {
      // A miss: the rival gloats, or the player's own avatar cheers them up.
      if (Math.random() < 0.5) {
        who = other;
        kind = "clash";
      } else {
        who = actor;
        kind = "encourage";
      }
    }
    if (say(who, kind, 2200)) lastSpokeRef.current = now;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMatchResult]);

  useEffect(
    () => () => {
      if (clearRef.current) clearTimeout(clearRef.current);
    },
    [],
  );

  return chatter;
}
