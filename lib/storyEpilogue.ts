import type { PanelActor, PreludePanel } from "./story";

// Burning-village ambiance used as the backdrop of the Gromak battle.
export const VILLAGE_BG: [string, string] = ["#1C0802", "#5E1B08"];
export const VILLAGE_DECOR = ["🌲", "🏚️", "🔥", "🏚️", "🌲"];

// Belic swoops in, carries the beaten Gromak into the shadows and taunts
// the hero — same staging whatever the battle outcome.
const BELIC_ACTORS: PanelActor[] = [
  { emoji: "⚡", x: 100, y: -180, size: 38, anim: "fade" },
  { emoji: "🦹", x: 0, y: -110, size: 96, anim: "pulse" },
  { emoji: "💨", x: -88, y: -45, size: 36, anim: "fade", delay: 300 },
  { emoji: "👹", x: 0, y: 60, size: 64, anim: "fade", delay: 150 },
  { emoji: "💫", x: 58, y: 30, size: 30, anim: "spin" },
  { emoji: "🦸", x: -95, y: 125, size: 48, anim: "pulse", delay: 250 },
];

/** Victory: Belic rescues the defeated Gromak before the celebration. */
export const BELIC_WIN: PreludePanel = {
  id: "belic-win",
  textKey: "story.epilogue.belicWinText",
  bg: ["#1A0510", "#3A0E3F"],
  glow: "#C026D3",
  effect: "attack",
  actors: BELIC_ACTORS,
  bubble: { textKey: "story.epilogue.belicBubble", x: 0, y: -20 },
};

/** Defeat: after the Lion's rescue, Belic carries Gromak away too. */
export const BELIC_LOSE: PreludePanel = {
  ...BELIC_WIN,
  id: "belic-lose",
  textKey: "story.epilogue.belicLoseText",
};

/** Victory: the village is saved, memories restored, the crowd cheers. */
export const EPILOGUE_WIN: PreludePanel = {
  id: "epilogue-win",
  textKey: "story.epilogue.winText",
  bg: ["#1B1206", "#54400E"],
  glow: "#FFD166",
  effect: "blessing",
  actors: [
    { emoji: "🏡", x: -95, y: -145, size: 50, anim: "bob" },
    { emoji: "🏡", x: 95, y: -135, size: 46, anim: "bob", delay: 300 },
    { emoji: "🦸", x: 0, y: -60, size: 80, anim: "pulse" },
    { emoji: "🎉", x: -105, y: 30, size: 38, anim: "pulse", delay: 150 },
    { emoji: "🎊", x: 105, y: 30, size: 38, anim: "pulse", delay: 450 },
    { emoji: "😊", x: -90, y: 125, size: 40, anim: "bob", delay: 100 },
    { emoji: "🥳", x: 0, y: 150, size: 40, anim: "bob", delay: 300 },
    { emoji: "🤗", x: 90, y: 125, size: 40, anim: "bob", delay: 500 },
  ],
  bubble: { textKey: "story.epilogue.winBubble", x: 0, y: 30 },
};

/** Closing scene (defeat path): the villagers cheer the hero on to join the Memory Guild. */
export const EPILOGUE_ENCOURAGE: PreludePanel = {
  id: "epilogue-encourage",
  textKey: "story.epilogue.encourageText",
  bg: ["#101A3E", "#2C4A9E"],
  glow: "#7EC8FF",
  effect: "blessing",
  actors: [
    { emoji: "🏛️", x: 0, y: -110, size: 84, anim: "bob" },
    { emoji: "🛡️", x: 0, y: 15, size: 38, anim: "pulse", delay: 200 },
    { emoji: "😊", x: -90, y: 115, size: 40, anim: "bob", delay: 100 },
    { emoji: "💪", x: 0, y: 145, size: 40, anim: "pulse", delay: 300 },
    { emoji: "🤗", x: 90, y: 115, size: 40, anim: "bob", delay: 500 },
  ],
  bubble: { textKey: "story.epilogue.encourageBubble", x: 0, y: -25 },
};

/** Defeat: the imperial guard Lion charges in and saves the hero. */
export const EPILOGUE_LOSE: PreludePanel = {
  id: "epilogue-lose",
  textKey: "story.epilogue.loseText",
  bg: ["#0B0E2A", "#1F3A5F"],
  glow: "#F59E0B",
  effect: "summon",
  actors: [
    { emoji: "👹", x: -112, y: -150, size: 52, anim: "fade" },
    { emoji: "💨", x: -58, y: -125, size: 36, anim: "fade", delay: 300 },
    { emoji: "🦁", x: 0, y: -60, size: 96, anim: "pulse" },
    { emoji: "🛡️", x: 82, y: -5, size: 40, anim: "pulse", delay: 250 },
    { emoji: "😵", x: 0, y: 115, size: 48, anim: "shake" },
    { emoji: "✨", x: -90, y: 145, size: 30, anim: "pulse", delay: 400 },
  ],
  bubble: { textKey: "story.epilogue.loseBubble", x: 0, y: 25 },
};
