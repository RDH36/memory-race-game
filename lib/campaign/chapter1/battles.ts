// Chapter 1 — battle intros told as webtoons (min 5 panels each):
// the brigand ambush on the road, then Gromak's revenge at Bourg-Soleil.
import type { PreludePanel } from "@/lib/story";

/** Skirmish intro — brigands rob travelers who can't even remember it. */
export const CH1_AMBUSH: PreludePanel[] = [
  {
    id: "ch1-ambush-noise",
    textKey: "story.chapter1.ambush.s1",
    bg: ["#04121F", "#0E4D3A"],
    glow: "#4ADE80",
    effect: "calm",
    actors: [
      { emoji: "🌲", x: -95, y: -130, size: 52, anim: "bob" },
      { emoji: "🌲", x: 95, y: -110, size: 46, anim: "bob", delay: 250 },
      { emoji: "👀", x: 60, y: -160, size: 34, anim: "fade", delay: 450 },
      { emoji: "🦸", x: -40, y: 70, size: 60, anim: "bob" },
      { emoji: "🦊", x: 50, y: 95, size: 44, anim: "shake", delay: 200 },
    ],
    bubble: { textKey: "story.chapter1.ambush.b1", x: 30, y: 20 },
  },
  {
    id: "ch1-ambush-victims",
    textKey: "story.chapter1.ambush.s2",
    bg: ["#14142B", "#2E2A55"],
    glow: "#A78BFA",
    effect: "calm",
    actors: [
      { emoji: "😶", x: -80, y: -60, size: 48, anim: "fade" },
      { emoji: "😶", x: 10, y: -30, size: 44, anim: "fade", delay: 250 },
      { emoji: "💰", x: 85, y: -110, size: 38, anim: "shake", delay: 400 },
      { emoji: "👺", x: 85, y: -40, size: 50, anim: "shake", delay: 150 },
      { emoji: "🎒", x: -40, y: 110, size: 40, anim: "fade", delay: 550 },
    ],
  },
  {
    id: "ch1-ambush-surround",
    textKey: "story.chapter1.ambush.s3",
    bg: ["#1C0802", "#5E1B08"],
    glow: "#FB923C",
    effect: "attack",
    actors: [
      { emoji: "👺", x: -90, y: -110, size: 56, anim: "shake" },
      { emoji: "👺", x: 90, y: -100, size: 56, anim: "shake", delay: 200 },
      { emoji: "👺", x: 0, y: -160, size: 50, anim: "shake", delay: 400 },
      { emoji: "🦸", x: -30, y: 70, size: 60, anim: "pulse" },
      { emoji: "👴", x: 60, y: 110, size: 44, anim: "shake", delay: 300 },
    ],
    bubble: { textKey: "story.chapter1.ambush.b3", x: 0, y: -30 },
  },
  {
    id: "ch1-ambush-fox",
    textKey: "story.chapter1.ambush.s4",
    bg: ["#1B1206", "#54400E"],
    glow: "#FFD166",
    effect: "blessing",
    actors: [
      { emoji: "🦊", x: -45, y: -60, size: 76, anim: "pulse" },
      { emoji: "🌪️", x: 50, y: -130, size: 42, anim: "spin", delay: 200 },
      { emoji: "🦸", x: 55, y: 60, size: 62, anim: "bob" },
      { emoji: "✨", x: -100, y: -150, size: 32, anim: "pulse", delay: 400 },
      { emoji: "👺", x: 95, y: 140, size: 40, anim: "shake", delay: 300 },
    ],
    bubble: { textKey: "story.chapter1.ambush.b4", x: -30, y: 25 },
  },
  {
    id: "ch1-ambush-duel",
    textKey: "story.chapter1.ambush.s5",
    bg: ["#0B0E2A", "#3B1A55"],
    glow: "#FACC15",
    effect: "summon",
    actors: [
      { emoji: "⚔️", x: 0, y: -150, size: 40, anim: "pulse" },
      { emoji: "👺", x: -75, y: -60, size: 70, anim: "shake" },
      { emoji: "🦸", x: 78, y: -50, size: 68, anim: "pulse", delay: 200 },
      { emoji: "🎴", x: -40, y: 85, size: 44, anim: "bob" },
      { emoji: "🎴", x: 42, y: 95, size: 44, anim: "bob", delay: 350 },
    ],
    bubble: { textKey: "story.chapter1.ambush.b5", x: 40, y: 30 },
  },
];

/** Boss intro — Gromak's revenge on the square of hollow Bourg-Soleil. */
export const CH1_GROMAK: PreludePanel[] = [
  {
    id: "ch1-gromak-arrives",
    textKey: "story.chapter1.gromak.s1",
    bg: ["#1B0A2E", "#3A1D6E"],
    glow: "#A78BFA",
    effect: "attack",
    actors: [
      { emoji: "👹", x: 0, y: -90, size: 100, anim: "shake" },
      { emoji: "👺", x: -95, y: 30, size: 44, anim: "fade", delay: 200 },
      { emoji: "👺", x: 95, y: 40, size: 44, anim: "fade", delay: 350 },
      { emoji: "🏚️", x: -70, y: -170, size: 44, anim: "fade", delay: 500 },
      { emoji: "🦸", x: 0, y: 130, size: 54, anim: "pulse" },
    ],
  },
  {
    id: "ch1-gromak-rage",
    textKey: "story.chapter1.gromak.s2",
    bg: ["#16030C", "#54101F"],
    glow: "#FF4D6D",
    effect: "attack",
    actors: [
      { emoji: "👹", x: 0, y: -70, size: 118, anim: "shake" },
      { emoji: "💢", x: -75, y: -160, size: 40, anim: "pulse", delay: 150 },
      { emoji: "⚡", x: 80, y: -170, size: 40, anim: "fade", delay: 300 },
      { emoji: "🔥", x: -95, y: 80, size: 38, anim: "pulse", delay: 450 },
      { emoji: "🔥", x: 95, y: 90, size: 38, anim: "pulse", delay: 600 },
    ],
    bubble: { textKey: "story.chapter1.gromak.b2", x: 0, y: 60 },
  },
  {
    id: "ch1-gromak-hostages",
    textKey: "story.chapter1.gromak.s3",
    bg: ["#14142B", "#2E2A55"],
    glow: "#7EC8FF",
    effect: "calm",
    actors: [
      { emoji: "😶", x: -90, y: -80, size: 42, anim: "fade" },
      { emoji: "😶", x: 0, y: -120, size: 42, anim: "fade", delay: 200 },
      { emoji: "😶", x: 90, y: -80, size: 42, anim: "fade", delay: 400 },
      { emoji: "👴", x: 60, y: 90, size: 46, anim: "shake", delay: 300 },
      { emoji: "🦸", x: -50, y: 70, size: 58, anim: "pulse" },
    ],
    bubble: { textKey: "story.chapter1.gromak.b3", x: 35, y: 30 },
  },
  {
    id: "ch1-gromak-warning",
    textKey: "story.chapter1.gromak.s4",
    bg: ["#1B1206", "#54400E"],
    glow: "#FFD166",
    effect: "blessing",
    actors: [
      { emoji: "🦊", x: -40, y: -60, size: 74, anim: "pulse" },
      { emoji: "🌪️", x: 55, y: -120, size: 46, anim: "spin", delay: 200 },
      { emoji: "👹", x: 80, y: 70, size: 60, anim: "shake", delay: 350 },
      { emoji: "🦸", x: -70, y: 90, size: 56, anim: "bob" },
      { emoji: "💫", x: -100, y: -150, size: 32, anim: "pulse", delay: 500 },
    ],
    bubble: { textKey: "story.chapter1.gromak.b4", x: -25, y: 25 },
  },
  {
    id: "ch1-gromak-duel",
    textKey: "story.chapter1.gromak.s5",
    bg: ["#0B0E2A", "#3B1A55"],
    glow: "#FACC15",
    effect: "summon",
    actors: [
      { emoji: "⚔️", x: 0, y: -150, size: 42, anim: "pulse" },
      { emoji: "👹", x: -78, y: -55, size: 84, anim: "shake" },
      { emoji: "🦸", x: 80, y: -45, size: 72, anim: "pulse", delay: 200 },
      { emoji: "🎴", x: -42, y: 85, size: 44, anim: "bob" },
      { emoji: "🎴", x: 42, y: 95, size: 44, anim: "bob", delay: 350 },
    ],
    bubble: { textKey: "story.chapter1.gromak.b5", x: -50, y: 25 },
  },
];
