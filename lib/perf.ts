import { useEffect, useState } from "react";

/**
 * Returns true after a short delay on mount. Use to gate withRepeat/infinite
 * Reanimated loops so they don't fire during the initial mount/transition.
 *
 * NOTE: previously used InteractionManager.runAfterInteractions, but in online
 * games each broadcast counts as an interaction — runAfterInteractions then
 * resolved precisely when broadcasts arrived, mounting the skin's particles
 * (Sparks/Particles) right when the opponent's flip animation needed to start,
 * delaying its visual start by 100-300 ms. A simple setTimeout is stable
 * regardless of UI activity.
 */
export function useDeferredAnimation(delayMs = 200): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);
  return ready;
}
