// ============================================================
// Haptics — Pulsar presets with a safe expo-haptics fallback.
//
// Pulsar resolves its native module via `getEnforcing`, which
// THROWS at import time if the dev client hasn't been rebuilt.
// We therefore lazy-require it inside try/catch: post-rebuild we
// get Pulsar's juicy presets, pre-rebuild we degrade gracefully
// to expo-haptics so the app never crashes.
// ============================================================
import * as Expo from "expo-haptics";

type PulsarPresets = {
  System: {
    impactLight: () => void;
    impactMedium: () => void;
    impactHeavy: () => void;
    impactRigid: () => void;
    selection: () => void;
    notificationSuccess: () => void;
    notificationWarning: () => void;
    notificationError: () => void;
  };
  flick: () => void;
  coinDrop: () => void;
  fanfare: () => void;
  buzz: () => void;
  ascent: () => void;
};

let pulsar: PulsarPresets | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  pulsar = require("react-native-pulsar").Presets as PulsarPresets;
} catch {
  pulsar = null;
}

let enabled = true;
/** Toggle all haptic feedback (wire to a user setting if desired). */
export function setHapticsEnabled(value: boolean) {
  enabled = value;
}

/** Run a Pulsar preset, falling back to expo-haptics, never throwing. */
function fire(pick: (p: PulsarPresets) => void, fallback: () => void) {
  if (!enabled) return;
  try {
    if (pulsar) {
      pick(pulsar);
      return;
    }
  } catch {
    // fall through to expo-haptics
  }
  try {
    fallback();
  } catch {
    // device without haptics — ignore
  }
}

const impact = (s: Expo.ImpactFeedbackStyle) => () => Expo.impactAsync(s);
const notify = (t: Expo.NotificationFeedbackType) => () => Expo.notificationAsync(t);

export const haptics = {
  /** Light UI tap — navigation, list rows, small buttons. */
  tap: () =>
    fire((p) => p.System.impactLight(), impact(Expo.ImpactFeedbackStyle.Light)),
  /** Medium press — the big JOUER / primary CTAs. */
  press: () =>
    fire((p) => p.System.impactMedium(), impact(Expo.ImpactFeedbackStyle.Medium)),
  /** Selection change — tabs, toggles, segmented controls. */
  select: () => fire((p) => p.System.selection(), () => Expo.selectionAsync()),
  /** Card flip — crisp tick. */
  flip: () =>
    fire((p) => p.flick(), impact(Expo.ImpactFeedbackStyle.Light)),
  /** Pair matched — juicy reward. */
  match: () =>
    fire((p) => p.coinDrop(), notify(Expo.NotificationFeedbackType.Success)),
  /** Wrong pair — short error buzz. */
  miss: () =>
    fire(
      (p) => p.System.notificationError(),
      notify(Expo.NotificationFeedbackType.Error),
    ),
  /** Coins / XP / daily reward collected. */
  coin: () =>
    fire((p) => p.coinDrop(), impact(Expo.ImpactFeedbackStyle.Medium)),
  /** Victory celebration. */
  win: () =>
    fire((p) => p.fanfare(), notify(Expo.NotificationFeedbackType.Success)),
  /** Defeat. */
  lose: () =>
    fire((p) => p.buzz(), notify(Expo.NotificationFeedbackType.Error)),
  /** Draw. */
  draw: () =>
    fire(
      (p) => p.System.notificationWarning(),
      notify(Expo.NotificationFeedbackType.Warning),
    ),
  /** Countdown tick (3 · 2 · 1). */
  countdown: () =>
    fire((p) => p.System.impactRigid(), impact(Expo.ImpactFeedbackStyle.Rigid)),
  /** GO! / match start. */
  go: () =>
    fire((p) => p.ascent(), impact(Expo.ImpactFeedbackStyle.Heavy)),
  /** Menacing rumble — story villain entrances. */
  rumble: () =>
    fire((p) => p.buzz(), impact(Expo.ImpactFeedbackStyle.Heavy)),
};

export type Haptics = typeof haptics;
