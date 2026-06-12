// Chapter 1 — the Tomir encounter intro: meeting the lost elder on the
// road, told as a webtoon before the memory-healing mini game.
import type { PreludePanel } from "@/lib/story";

export const CH1_TOMIR: PreludePanel[] = [
  {
    id: "ch1-tomir-meet",
    textKey: "story.chapter1.tomir.s1",
    bg: ["#14142B", "#2E2A55"],
    glow: "#A78BFA",
    effect: "calm",
    actors: [
      { emoji: "🌫️", x: 0, y: -150, size: 60, anim: "fade" },
      { emoji: "👴", x: -40, y: -40, size: 76, anim: "shake" },
      { emoji: "🦸", x: 60, y: 80, size: 60, anim: "bob" },
      { emoji: "🦊", x: -85, y: 120, size: 42, anim: "bob", delay: 250 },
      { emoji: "🌲", x: 100, y: -80, size: 40, anim: "bob", delay: 400 },
    ],
    bubble: { textKey: "story.chapter1.tomir.b1", x: 30, y: 10 },
  },
  {
    id: "ch1-tomir-lost",
    textKey: "story.chapter1.tomir.s2",
    bg: ["#1B0A2E", "#3A1D6E"],
    glow: "#F472B6",
    effect: "calm",
    actors: [
      { emoji: "👴", x: 0, y: -60, size: 84, anim: "shake" },
      { emoji: "❓", x: -70, y: -150, size: 40, anim: "fade", delay: 150 },
      { emoji: "❓", x: 65, y: -140, size: 34, anim: "fade", delay: 400 },
      { emoji: "💭", x: 0, y: -160, size: 44, anim: "pulse", delay: 250 },
      { emoji: "😟", x: -80, y: 110, size: 44, anim: "bob" },
    ],
    bubble: { textKey: "story.chapter1.tomir.b2", x: 0, y: 50 },
  },
  {
    id: "ch1-tomir-fox",
    textKey: "story.chapter1.tomir.s3",
    bg: ["#16030C", "#54101F"],
    glow: "#FF4D6D",
    effect: "attack",
    actors: [
      { emoji: "🦊", x: -45, y: -60, size: 70, anim: "pulse" },
      { emoji: "🧠", x: 50, y: -120, size: 44, anim: "fade", delay: 200 },
      { emoji: "💔", x: 50, y: -30, size: 36, anim: "pulse", delay: 400 },
      { emoji: "👺", x: 95, y: -160, size: 38, anim: "fade", delay: 550 },
      { emoji: "👴", x: -10, y: 100, size: 56, anim: "shake", delay: 150 },
    ],
    bubble: { textKey: "story.chapter1.tomir.b3", x: -30, y: 30 },
  },
  {
    id: "ch1-tomir-gift",
    textKey: "story.chapter1.tomir.s4",
    bg: ["#1B1206", "#54400E"],
    glow: "#FFD166",
    effect: "blessing",
    actors: [
      { emoji: "🦸", x: -40, y: -50, size: 72, anim: "pulse" },
      { emoji: "✨", x: -95, y: -140, size: 34, anim: "pulse", delay: 200 },
      { emoji: "💫", x: 60, y: -150, size: 34, anim: "pulse", delay: 400 },
      { emoji: "👴", x: 50, y: 80, size: 60, anim: "bob" },
      { emoji: "🫂", x: -60, y: 130, size: 38, anim: "pulse", delay: 550 },
    ],
    bubble: { textKey: "story.chapter1.tomir.b4", x: -25, y: 20 },
  },
  {
    id: "ch1-tomir-fragments",
    textKey: "story.chapter1.tomir.s5",
    bg: ["#0B0E2A", "#3B1A55"],
    glow: "#FACC15",
    effect: "summon",
    actors: [
      { emoji: "💭", x: 0, y: -140, size: 56, anim: "pulse" },
      { emoji: "🏡", x: -85, y: -50, size: 44, anim: "bob", delay: 150 },
      { emoji: "👧", x: 0, y: -30, size: 44, anim: "bob", delay: 350 },
      { emoji: "🍞", x: 85, y: -50, size: 44, anim: "bob", delay: 550 },
      { emoji: "👴", x: -55, y: 110, size: 54, anim: "bob" },
      { emoji: "✨", x: 65, y: 120, size: 32, anim: "pulse", delay: 450 },
    ],
    bubble: { textKey: "story.chapter1.tomir.b5", x: 20, y: 40 },
  },
];
