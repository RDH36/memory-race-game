// PostHog analytics — shares Mitsitsy's free project; every event carries
// an `app: "flipia"` super-property so the two apps stay separable in the
// dashboard (filter on `app`). No 2nd project needed (free tier = 1 project).
import { useEffect, useState } from "react";
import PostHog from "posthog-react-native";

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
const enabled = !!apiKey;

// Silence offline flush spam in the console.
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const msg = typeof args[0] === "string" ? args[0] : "";
  if (msg.includes("Error while flushing PostHog")) return;
  originalConsoleError(...args);
};

const posthog = new PostHog(apiKey || "placeholder", {
  host,
  disabled: !enabled,
  captureAppLifecycleEvents: true,
  flushAt: 20,
  flushInterval: 10000,
});

// Tag every event with the app id so Flipia data is isolated from Mitsitsy.
if (enabled) posthog.register({ app: "flipia" });

type EventProps = Record<string, string | number | boolean | null | undefined>;

/** Fire-and-forget analytics event. No-op when PostHog isn't configured. */
export function track(event: string, props?: EventProps) {
  if (!enabled) return;
  // Drop undefined values — PostHog's JSON props type doesn't allow them.
  const clean = props
    ? (Object.fromEntries(
        Object.entries(props).filter(([, v]) => v !== undefined),
      ) as Record<string, string | number | boolean | null>)
    : undefined;
  posthog.capture(event, clean);
}

/** Tie events to the real (InstantDB) user — fixes retention across reinstalls. */
export function identify(distinctId: string | undefined | null) {
  if (!enabled || !distinctId) return;
  posthog.identify(distinctId);
}

/**
 * Read a boolean feature flag reactively. Defaults to `fallback` (true) so a
 * flag-less or offline state never hides a feature — flip the flag to false
 * in PostHog to kill a feature remotely without a release.
 */
export function useFlag(key: string, fallback = true): boolean {
  const [value, setValue] = useState(fallback);
  useEffect(() => {
    if (!enabled) return;
    const read = () => {
      const r = posthog.getFeatureFlag(key);
      setValue(r === undefined ? fallback : r === true || r === "true");
    };
    read();
    return posthog.onFeatureFlags(read);
  }, [key, fallback]);
  return value;
}
