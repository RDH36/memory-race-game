// Campaign progress hook — mirrors the ability economy (lib/abilities.ts):
// every mutation is a single atomic profile transaction (gold + progress
// JSON live on the same entity).
import { useCallback, useMemo } from "react";
import { db } from "@/lib/instant";
import { tx } from "@instantdb/react-native";
import { usePlayerStats } from "@/lib/playerStats";
import { parseProgress, serializeProgress } from "./types";
import type { CampaignProgress, StoryChapterDef } from "./types";

/** Free chapters are implicitly unlocked. */
export function isChapterUnlocked(progress: CampaignProgress, chapter: StoryChapterDef): boolean {
  return chapter.unlockCost === 0 || progress.unlocked.includes(chapter.id);
}

export function isChapterCompleted(progress: CampaignProgress, chapterId: string): boolean {
  return progress.completed.includes(chapterId);
}

/**
 * Story-locked avatars: locked until their chapter is completed, except
 * for grandfathered players who already wear the avatar.
 */
export function isStoryAvatarUnlocked(
  storyChapter: string | undefined,
  progress: CampaignProgress,
  equippedAvatar: string,
  avatarId: string,
): boolean {
  if (!storyChapter) return true;
  if (equippedAvatar === avatarId) return true;
  return isChapterCompleted(progress, storyChapter);
}

export function useCampaign() {
  const { profileId, gold, lives, avatar, storyProgressRaw } = usePlayerStats();
  const progress = useMemo(() => parseProgress(storyProgressRaw), [storyProgressRaw]);

  const stepIndex = useCallback(
    (chapterId: string) => progress.step[chapterId] ?? 0,
    [progress],
  );

  /** Spend gold to open a paid chapter. Returns false when not affordable. */
  const unlockChapter = useCallback(
    (chapter: StoryChapterDef): boolean => {
      if (!profileId || isChapterUnlocked(progress, chapter)) return false;
      if (gold < chapter.unlockCost) return false;
      const next = serializeProgress({
        ...progress,
        unlocked: [...progress.unlocked, chapter.id],
      });
      db.transact(tx.profiles[profileId].update({ gold: gold - chapter.unlockCost, storyProgress: next }));
      return true;
    },
    [profileId, gold, progress],
  );

  /** Move to the next step of a chapter (capped at steps.length). */
  const advanceStep = useCallback(
    (chapter: StoryChapterDef, fromIndex: number) => {
      if (!profileId) return;
      const current = progress.step[chapter.id] ?? 0;
      // Replays of past steps must not move the cursor.
      if (fromIndex !== current || current >= chapter.steps.length) return;
      const next = serializeProgress({
        ...progress,
        step: { ...progress.step, [chapter.id]: current + 1 },
      });
      db.transact(tx.profiles[profileId].update({ storyProgress: next }));
    },
    [profileId, progress],
  );

  /** Grant the chapter rewards once — gold, hearts and completion atomically. */
  const completeChapter = useCallback(
    (chapter: StoryChapterDef): boolean => {
      if (!profileId || isChapterCompleted(progress, chapter.id)) return false;
      const next = serializeProgress({
        ...progress,
        completed: [...progress.completed, chapter.id],
      });
      db.transact(
        tx.profiles[profileId].update({
          gold: gold + chapter.rewardGold,
          lives: lives + chapter.rewardLives,
          storyProgress: next,
        }),
      );
      return true;
    },
    [profileId, gold, lives, progress],
  );

  const isAvatarUnlocked = useCallback(
    (avatarId: string, storyChapter: string | undefined) =>
      isStoryAvatarUnlocked(storyChapter, progress, avatar, avatarId),
    [progress, avatar],
  );

  return { progress, gold, stepIndex, unlockChapter, advanceStep, completeChapter, isAvatarUnlocked };
}
