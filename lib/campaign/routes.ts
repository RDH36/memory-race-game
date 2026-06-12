// Step → screen routing for the campaign flow. "Continue" chains straight
// into the next step's screen; the hub is only the resume/replay point.
import type { ChapterStep, StoryChapterDef } from "./types";

export const STEP_ROUTES: Record<ChapterStep["type"], string> = {
  scene: "/story/scene",
  encounter: "/story/encounter",
  skirmish: "/story/battle",
  boss: "/story/battle",
};

export type StepHref = { pathname: string; params: { step: string } };

export function stepHref(chapter: StoryChapterDef, index: number): StepHref | null {
  const step = chapter.steps[index];
  if (!step) return null;
  return { pathname: STEP_ROUTES[step.type], params: { step: String(index) } };
}
