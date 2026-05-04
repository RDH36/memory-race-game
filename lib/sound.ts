import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";

let flipPlayer: AudioPlayer | null = null;
let matchPlayer: AudioPlayer | null = null;
let lastFlipAt = 0;
let lastMatchAt = 0;
const FLIP_THROTTLE_MS = 60;
const MATCH_THROTTLE_MS = 120;

function getFlipPlayer(): AudioPlayer {
  if (!flipPlayer) {
    flipPlayer = createAudioPlayer(require("../assets/audio/flipcard.wav"));
  }
  return flipPlayer;
}

function getMatchPlayer(): AudioPlayer {
  if (!matchPlayer) {
    matchPlayer = createAudioPlayer(require("../assets/audio/collect.wav"));
  }
  return matchPlayer;
}

export async function configureAudioMode() {
  try {
    await setAudioModeAsync({
      playsInSilentMode: false,
      allowsRecording: false,
      shouldPlayInBackground: false,
      interruptionMode: "mixWithOthers",
    });
  } catch {}
}

export function playFlip() {
  const now = Date.now();
  if (now - lastFlipAt < FLIP_THROTTLE_MS) return;
  lastFlipAt = now;
  try {
    const p = getFlipPlayer();
    p.seekTo(0)
      .then(() => p.play())
      .catch(() => {});
  } catch {}
}

export function playMatch() {
  const now = Date.now();
  if (now - lastMatchAt < MATCH_THROTTLE_MS) return;
  lastMatchAt = now;
  try {
    const p = getMatchPlayer();
    p.seekTo(0)
      .then(() => p.play())
      .catch(() => {});
  } catch {}
}
