import { useEffect, useState } from "react";
import { InteractionManager } from "react-native";

/**
 * Returns true once nav transitions / pending interactions have settled.
 * Use to gate withRepeat/infinite Reanimated loops so they don't compete with
 * a slide-in animation for UI thread time.
 */
export function useDeferredAnimation(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });
    return () => handle.cancel();
  }, []);
  return ready;
}
