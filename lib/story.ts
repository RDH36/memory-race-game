// Flipia lore — the Emoji Kingdom lost its memory to the Demon King.
// Single source of truth for the narrative: onboarding prelude today,
// story campaign chapters tomorrow.

/** Mood of a webtoon panel — drives the haptic accent when it scrolls in. */
export type PreludeEffect = "calm" | "attack" | "blessing" | "summon" | "portal";

export type ActorAnim = "bob" | "shake" | "pulse" | "fade" | "spin";

export type PanelActor = {
  emoji: string;
  /** Offset in px from the panel center. */
  x: number;
  y: number;
  size: number;
  anim: ActorAnim;
  delay?: number;
};

export type PanelBubble = {
  /** i18n key under `story.prelude.*` */
  textKey: string;
  x: number;
  y: number;
};

export type PreludePanel = {
  id: string;
  /** Narration caption — i18n key under `story.prelude.*` */
  textKey: string;
  /** Panel backdrop gradient, top → bottom. */
  bg: [string, string];
  /** Accent glow (halo, particles, panel number chip). */
  glow: string;
  actors: PanelActor[];
  bubble?: PanelBubble;
  effect: PreludeEffect;
};

// The prelude as a vertical webtoon — each panel is a staged comic frame
// the player scrolls through.
export const PRELUDE_PANELS: PreludePanel[] = [
  {
    id: "kingdom",
    textKey: "story.prelude.s1",
    bg: ["#101A3E", "#2C4A9E"],
    glow: "#7EC8FF",
    effect: "calm",
    actors: [
      { emoji: "☀️", x: 112, y: -185, size: 42, anim: "pulse" },
      { emoji: "🏰", x: 0, y: -70, size: 96, anim: "bob" },
      { emoji: "😊", x: -95, y: 95, size: 38, anim: "bob", delay: 200 },
      { emoji: "🥳", x: 0, y: 125, size: 38, anim: "bob", delay: 420 },
      { emoji: "🤩", x: 95, y: 95, size: 38, anim: "bob", delay: 640 },
    ],
    bubble: { textKey: "story.prelude.b1", x: 0, y: 30 },
  },
  {
    id: "attack",
    textKey: "story.prelude.s2",
    bg: ["#16030C", "#54101F"],
    glow: "#FF4D6D",
    effect: "attack",
    actors: [
      { emoji: "⚡", x: -108, y: -190, size: 42, anim: "fade" },
      { emoji: "⚡", x: 110, y: -175, size: 46, anim: "fade", delay: 320 },
      { emoji: "😈", x: 0, y: -100, size: 118, anim: "shake" },
      { emoji: "🧠", x: -52, y: 55, size: 30, anim: "fade", delay: 150 },
      { emoji: "🧠", x: 55, y: 70, size: 26, anim: "fade", delay: 500 },
      { emoji: "😱", x: -92, y: 135, size: 40, anim: "shake", delay: 120 },
      { emoji: "😨", x: 0, y: 160, size: 40, anim: "shake", delay: 240 },
      { emoji: "😰", x: 92, y: 135, size: 40, anim: "shake", delay: 360 },
    ],
    bubble: { textKey: "story.prelude.b2", x: 0, y: -5 },
  },
  {
    id: "angels",
    textKey: "story.prelude.s3",
    bg: ["#1B1206", "#54400E"],
    glow: "#FFD166",
    effect: "blessing",
    actors: [
      { emoji: "✨", x: -105, y: -175, size: 36, anim: "pulse" },
      { emoji: "💫", x: 105, y: -160, size: 36, anim: "pulse", delay: 400 },
      { emoji: "👼", x: 0, y: -105, size: 100, anim: "bob" },
      { emoji: "🛡️", x: 0, y: 55, size: 36, anim: "pulse", delay: 200 },
      { emoji: "🦊", x: -90, y: 135, size: 40, anim: "bob", delay: 150 },
      { emoji: "🐳", x: 0, y: 160, size: 40, anim: "bob", delay: 350 },
      { emoji: "🦁", x: 90, y: 135, size: 40, anim: "bob", delay: 550 },
    ],
    bubble: { textKey: "story.prelude.b3", x: 0, y: -10 },
  },
  {
    id: "summon",
    textKey: "story.prelude.s4",
    bg: ["#140A2E", "#3A1D6E"],
    glow: "#A78BFA",
    effect: "summon",
    actors: [
      { emoji: "👑", x: 0, y: -150, size: 80, anim: "pulse" },
      { emoji: "🤴", x: -92, y: -45, size: 46, anim: "bob" },
      { emoji: "👸", x: 92, y: -45, size: 46, anim: "bob", delay: 300 },
      { emoji: "📜", x: 0, y: 75, size: 62, anim: "pulse", delay: 200 },
      { emoji: "✨", x: -95, y: 145, size: 32, anim: "pulse", delay: 100 },
      { emoji: "✨", x: 95, y: 145, size: 32, anim: "pulse", delay: 500 },
    ],
    bubble: { textKey: "story.prelude.b4", x: 0, y: 15 },
  },
  {
    id: "hero",
    textKey: "story.prelude.s5",
    bg: ["#04121F", "#0E4D3A"],
    glow: "#4ADE80",
    effect: "portal",
    actors: [
      { emoji: "🌀", x: 0, y: -100, size: 112, anim: "spin" },
      { emoji: "🦸", x: 0, y: -95, size: 70, anim: "pulse" },
      { emoji: "📱", x: -100, y: 75, size: 44, anim: "fade" },
      { emoji: "⚡", x: 102, y: 65, size: 38, anim: "pulse", delay: 250 },
      { emoji: "✨", x: 0, y: 140, size: 34, anim: "pulse", delay: 450 },
    ],
    bubble: { textKey: "story.prelude.b5", x: 0, y: 35 },
  },
  {
    id: "glitch",
    textKey: "story.prelude.s6",
    bg: ["#1B0A2E", "#5B1457"],
    glow: "#F472B6",
    effect: "portal",
    actors: [
      { emoji: "⚡", x: -98, y: -170, size: 40, anim: "fade" },
      { emoji: "🌀", x: 0, y: -110, size: 104, anim: "spin" },
      { emoji: "⚡", x: 100, y: -155, size: 44, anim: "fade", delay: 350 },
      { emoji: "🦸", x: 35, y: -25, size: 60, anim: "spin" },
      { emoji: "💫", x: -85, y: 50, size: 36, anim: "pulse", delay: 200 },
      { emoji: "🤴", x: -90, y: 145, size: 40, anim: "shake" },
      { emoji: "👸", x: 90, y: 145, size: 40, anim: "shake", delay: 180 },
    ],
    bubble: { textKey: "story.prelude.b6", x: 0, y: 60 },
  },
  {
    id: "village",
    textKey: "story.prelude.s7",
    bg: ["#1C0802", "#5E1B08"],
    glow: "#FB923C",
    effect: "attack",
    actors: [
      { emoji: "👹", x: 0, y: -115, size: 110, anim: "shake" },
      { emoji: "🔥", x: -105, y: 30, size: 44, anim: "pulse" },
      { emoji: "🔥", x: 105, y: 55, size: 38, anim: "pulse", delay: 400 },
      { emoji: "🏚️", x: -60, y: 95, size: 54, anim: "shake", delay: 150 },
      { emoji: "🏚️", x: 62, y: 115, size: 46, anim: "shake", delay: 300 },
      { emoji: "😱", x: -102, y: 165, size: 36, anim: "shake", delay: 100 },
      { emoji: "😨", x: 102, y: 168, size: 36, anim: "shake", delay: 250 },
    ],
    bubble: { textKey: "story.prelude.b7", x: 0, y: -20 },
  },
  {
    id: "challenge",
    textKey: "story.prelude.s8",
    bg: ["#0B0E2A", "#3B1A55"],
    glow: "#FACC15",
    effect: "summon",
    actors: [
      { emoji: "⚔️", x: 0, y: -115, size: 40, anim: "pulse" },
      { emoji: "👹", x: -78, y: -55, size: 84, anim: "shake" },
      { emoji: "🦸", x: 80, y: -45, size: 72, anim: "pulse", delay: 200 },
      { emoji: "🎴", x: -42, y: 80, size: 44, anim: "bob" },
      { emoji: "🎴", x: 42, y: 90, size: 44, anim: "bob", delay: 350 },
      { emoji: "✨", x: 0, y: 155, size: 30, anim: "pulse", delay: 500 },
    ],
    bubble: { textKey: "story.prelude.b8", x: -55, y: 25 },
  },
];

export type StoryBoss = {
  id: string;
  /** Proper noun, same in every language. */
  name: string;
  avatar: string;
  /** i18n key for the boss title/role. */
  roleKey: string;
};

/** First enemy the hero faces — beaten during onboarding. */
export const BRIGADE_CHIEF: StoryBoss = {
  id: "brigade-chief",
  name: "Gromak",
  avatar: "👹",
  roleKey: "story.brigadeChief.role",
};

/** Officer of the Demon King — rescues his minions and taunts the hero. */
export const BELIC: StoryBoss = {
  id: "belic",
  name: "Belic",
  avatar: "🦹",
  roleKey: "story.belic.role",
};

/** Final boss of the future story campaign. */
export const DEMON_KING: StoryBoss = {
  id: "demon-king",
  name: "Mnemos",
  avatar: "😈",
  roleKey: "story.demonKing.role",
};

export type CampaignChapter = {
  id: string;
  boss: StoryBoss;
  difficulty: "easy" | "medium" | "hard";
};

// Skeleton for the upcoming story campaign mode: each chapter pits the hero
// against one of the Demon King's brigades, ending with the king himself.
export const CAMPAIGN_CHAPTERS: CampaignChapter[] = [
  { id: "chapter-1", boss: BRIGADE_CHIEF, difficulty: "easy" },
  { id: "chapter-final", boss: DEMON_KING, difficulty: "hard" },
];
