// Story campaign — chapter/step shapes and progress (de)serialization.
// A chapter is a journey: webtoon scenes, memory-healing encounters,
// road skirmishes, then the brigade boss. See docs/STORY_CAMPAIGN.md.
import type { PreludePanel } from "@/lib/story";
import type { CpuDifficulty } from "@/lib/gameLogic";

/** Enemy faced in a skirmish or boss step. */
export type StepEnemy = {
  avatar: string;
  /** Proper noun (same in every language) — takes precedence over nameKey. */
  name?: string;
  /** i18n key for generic enemies ("Brigand"). */
  nameKey?: string;
  /** i18n key for the pre-battle taunt bubble. */
  introKey: string;
};

export type SceneStep = {
  type: "scene";
  id: string;
  panels: PreludePanel[];
};

/** Memory-healing mini game: solo 2×3 grid, no opponent, no timer. */
export type EncounterStep = {
  type: "encounter";
  id: string;
  npcEmoji: string;
  /** Webtoon intro told before the healing mini game. */
  panels: PreludePanel[];
  /** Victory story card(s) shown after the healing, before the next step. */
  outroPanels: PreludePanel[];
  /** One emoji per pair (3 pairs → 6 cards). */
  cardEmojis: string[];
  /** i18n keys under `story.{chapter}.{id}.*`: intro, success. */
  introKey: string;
  successKey: string;
};

export type BattleStep = {
  type: "skirmish" | "boss";
  id: string;
  /** Webtoon intro told before the fight (min 5 panels). */
  panels: PreludePanel[];
  /** Victory story card(s) shown after the win, before the next step. */
  outroPanels: PreludePanel[];
  enemy: StepEnemy;
  /** Drives grid size AND cpu memory (lib/gameLogic GRID_CONFIG). */
  difficulty: CpuDifficulty;
  /** Fixed enemy ability (never random in story battles). */
  cpuAbility: { id: string; level: number };
};

export type ChapterStep = SceneStep | EncounterStep | BattleStep;

export type StoryChapterDef = {
  id: string;
  /** i18n key for the chapter title. */
  titleKey: string;
  /** Gold needed to unlock (0 = free). */
  unlockCost: number;
  rewardGold: number;
  /** Hearts granted on completion (retry currency for encounters). */
  rewardLives: number;
  /** Avatar skin id unlocked on completion (see lib/skins.ts storyChapter). */
  rewardAvatarId: string;
  steps: ChapterStep[];
};

// --- Progress (JSON string stored on profiles.storyProgress) ---------------

export type CampaignProgress = {
  /** Chapter ids unlocked (paid or free). */
  unlocked: string[];
  /** Chapter ids fully completed (rewards claimed). */
  completed: string[];
  /** Current step index per chapter id. */
  step: Record<string, number>;
};

const EMPTY: CampaignProgress = { unlocked: [], completed: [], step: {} };

export function parseProgress(raw: string | undefined | null): CampaignProgress {
  if (!raw) return EMPTY;
  try {
    const p = JSON.parse(raw);
    return {
      unlocked: Array.isArray(p?.unlocked) ? p.unlocked : [],
      completed: Array.isArray(p?.completed) ? p.completed : [],
      step: typeof p?.step === "object" && p?.step ? p.step : {},
    };
  } catch {
    return EMPTY;
  }
}

export function serializeProgress(progress: CampaignProgress): string {
  return JSON.stringify(progress);
}
