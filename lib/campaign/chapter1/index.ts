// Chapter 1 — "La Route des Cendres": the road from the saved village to
// Bourg-Soleil. Free to start; rewards gold + the 🦊 avatar.
import { BRIGADE_CHIEF } from "@/lib/story";
import { CH1_DEPART, CH1_VILLAGE, CH1_OUTRO } from "./panels";
import { CH1_TOMIR, CH1_TOMIR_OUTRO } from "./tomir";
import { CH1_AMBUSH, CH1_AMBUSH_OUTRO, CH1_GROMAK, CH1_GROMAK_OUTRO } from "./battles";
import type { StoryChapterDef } from "../types";

export const CHAPTER_1: StoryChapterDef = {
  id: "chapter-1",
  titleKey: "story.chapter1.title",
  unlockCost: 0,
  rewardGold: 300,
  rewardLives: 3,
  rewardAvatarId: "🦊",
  steps: [
    { type: "scene", id: "depart", panels: CH1_DEPART },
    {
      type: "encounter",
      id: "tomir",
      npcEmoji: "👴",
      panels: CH1_TOMIR,
      outroPanels: CH1_TOMIR_OUTRO,
      cardEmojis: ["🏡", "👧", "🍞"],
      introKey: "story.chapter1.tomir.intro",
      successKey: "story.chapter1.tomir.success",
    },
    {
      type: "skirmish",
      id: "ambush",
      panels: CH1_AMBUSH,
      outroPanels: CH1_AMBUSH_OUTRO,
      enemy: {
        avatar: "👺",
        nameKey: "story.chapter1.ambush.name",
        introKey: "story.chapter1.ambush.intro",
      },
      difficulty: "easy",
      cpuAbility: { id: "tornado", level: 1 },
    },
    { type: "scene", id: "village", panels: CH1_VILLAGE },
    {
      type: "boss",
      id: "gromak",
      panels: CH1_GROMAK,
      outroPanels: CH1_GROMAK_OUTRO,
      enemy: {
        avatar: BRIGADE_CHIEF.avatar,
        name: BRIGADE_CHIEF.name,
        introKey: "story.chapter1.gromak.intro",
      },
      difficulty: "medium",
      cpuAbility: { id: "tornado", level: 1 },
    },
    { type: "scene", id: "outro", panels: CH1_OUTRO },
  ],
};

/** All playable chapters, in order. Chapters 2+ ship in later updates. */
export const STORY_CHAPTERS: StoryChapterDef[] = [CHAPTER_1];

/** Teaser for the next (not yet playable) chapter on the campaign map. */
export const NEXT_CHAPTER_TEASER = {
  id: "chapter-2",
  titleKey: "story.campaign.chapter2Title",
  unlockCost: 800,
};

export function getChapter(id: string): StoryChapterDef | undefined {
  return STORY_CHAPTERS.find((c) => c.id === id);
}
