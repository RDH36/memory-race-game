import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { ENTITLEMENT } from "../../lib/revenuecat";
import type { EntitlementKey } from "../../lib/skins";
import { getPremiumTheme } from "../../lib/premiumTheme";
import { useDeferredAnimation } from "../../lib/perf";

interface LayerConfig {
  scaleTo: number;
  opacityFrom: number;
  opacityTo: number;
  period: number;
  delay: number;
  /** Which palette color to use: 'main' = haloColor, 'accent' = haloAccent */
  tone: "main" | "accent";
}

interface AuraConfig {
  layers: LayerConfig[];
}

const AURA_CONFIGS: Record<EntitlementKey, AuraConfig> = {
  // Premium (Crown) — smooth regal breathing, gold
  [ENTITLEMENT.PREMIUM]: {
    layers: [
      { scaleTo: 1.12, opacityFrom: 0.55, opacityTo: 0.95, period: 2200, delay: 0,   tone: "main"   },
      { scaleTo: 1.26, opacityFrom: 0.30, opacityTo: 0.55, period: 2600, delay: 320, tone: "main"   },
      { scaleTo: 1.42, opacityFrom: 0.12, opacityTo: 0.32, period: 3000, delay: 640, tone: "accent" },
    ],
  },
  // Angel — slowest, softest ethereal pulse
  [ENTITLEMENT.PACK_ANGEL]: {
    layers: [
      { scaleTo: 1.10, opacityFrom: 0.55, opacityTo: 0.90, period: 2800, delay: 0,   tone: "main"   },
      { scaleTo: 1.22, opacityFrom: 0.28, opacityTo: 0.50, period: 3200, delay: 400, tone: "accent" },
      { scaleTo: 1.38, opacityFrom: 0.10, opacityTo: 0.28, period: 3600, delay: 800, tone: "main"   },
    ],
  },
  // Demon — fast erratic flame-like flicker, ember
  [ENTITLEMENT.PACK_DEMON]: {
    layers: [
      { scaleTo: 1.14, opacityFrom: 0.45, opacityTo: 1.00, period: 1100, delay: 0,   tone: "main"   },
      { scaleTo: 1.30, opacityFrom: 0.30, opacityTo: 0.70, period: 1500, delay: 180, tone: "accent" },
      { scaleTo: 1.50, opacityFrom: 0.12, opacityTo: 0.45, period: 1900, delay: 360, tone: "main"   },
      // Extra fast flicker layer for flame tip feel
      { scaleTo: 1.20, opacityFrom: 0.20, opacityTo: 0.85, period: 700,  delay: 100, tone: "accent" },
    ],
  },
};

interface AuraLayerProps {
  size: number;
  borderRadius: number;
  color: string;
  scaleTo: number;
  opacityFrom: number;
  opacityTo: number;
  period: number;
  delay: number;
}

function AuraLayer({
  size,
  borderRadius,
  color,
  scaleTo,
  opacityFrom,
  opacityTo,
  period,
  delay,
}: AuraLayerProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(opacityFrom);
  const deferred = useDeferredAnimation();

  useEffect(() => {
    if (!deferred) return;
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(scaleTo, { duration: period, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(opacityTo, { duration: period, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      ),
    );
    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, [deferred, delay, scaleTo, opacityTo, period]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          width: size,
          height: size,
          borderRadius,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

interface Props {
  entitlement: EntitlementKey;
  size: number;
  borderRadius: number;
}

/**
 * Animated multi-layer aura behind a premium tile.
 * Each pack has its own character (smooth/gentle/flicker).
 * Layers scale + fade in offset phases, creating a living aura/flame effect.
 */
export function AnimatedAura({ entitlement, size, borderRadius }: Props) {
  const theme = getPremiumTheme(entitlement);
  const config = AURA_CONFIGS[entitlement];
  if (!theme || !config) return null;

  return (
    <>
      {config.layers.map((layer, i) => (
        <AuraLayer
          key={i}
          size={size}
          borderRadius={borderRadius}
          color={layer.tone === "main" ? theme.haloColor : theme.haloAccent}
          scaleTo={layer.scaleTo}
          opacityFrom={layer.opacityFrom}
          opacityTo={layer.opacityTo}
          period={layer.period}
          delay={layer.delay}
        />
      ))}
    </>
  );
}
