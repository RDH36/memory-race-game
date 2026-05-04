import { useEffect, useMemo } from "react";
import { Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Path } from "react-native-svg";
import { ENTITLEMENT } from "../../lib/revenuecat";
import type { EntitlementKey } from "../../lib/skins";
import { getPremiumTheme, type PremiumTheme } from "../../lib/premiumTheme";
import { useDeferredAnimation } from "../../lib/perf";

type ShapeName = "flame" | "star" | "ray";

interface ShapeConfig {
  shape: ShapeName;
  count: number;
  /** Shape width as a fraction of tile size */
  sizeRatio: number;
  /** Distance beyond tile half-width as fraction of tile size (positive = outside) */
  offsetRatio: number;
  /** Minimum absolute shape size in px (avoids invisible shapes on tiny tiles) */
  minSize: number;
  period: number;
  scaleFrom: number;
  scaleTo: number;
  opacityFrom: number;
  opacityTo: number;
  jitter: number;
  rotateAssembly: boolean;
  pointOutward: boolean;
}

const CONFIGS: Record<EntitlementKey, ShapeConfig> = {
  // Crown — slow rotating ring of gold stars
  [ENTITLEMENT.PREMIUM]: {
    shape: "star",
    count: 6,
    sizeRatio: 0.28,
    offsetRatio: 0.20,
    minSize: 10,
    period: 2200,
    scaleFrom: 0.7,
    scaleTo: 1.2,
    opacityFrom: 0.55,
    opacityTo: 1.0,
    jitter: 0.35,
    rotateAssembly: true,
    pointOutward: false,
  },
  // Angel — radiating ivory light rays
  [ENTITLEMENT.PACK_ANGEL]: {
    shape: "ray",
    count: 8,
    sizeRatio: 0.15,
    offsetRatio: 0.16,
    minSize: 5,
    period: 2600,
    scaleFrom: 0.55,
    scaleTo: 1.25,
    opacityFrom: 0.3,
    opacityTo: 0.95,
    jitter: 0.4,
    rotateAssembly: false,
    pointOutward: true,
  },
  // Demon — dark menacing spikes with slow ominous pulse
  [ENTITLEMENT.PACK_DEMON]: {
    shape: "flame",
    count: 8,
    sizeRatio: 0.22,
    offsetRatio: 0.18,
    minSize: 10,
    period: 1400,
    scaleFrom: 0.6,
    scaleTo: 1.3,
    opacityFrom: 0.45,
    opacityTo: 1.0,
    jitter: 0.45,
    rotateAssembly: false,
    pointOutward: true,
  },
};

type ShapeRender =
  | { kind: "svg"; viewBox: string; path: string; aspect: number; useGradient: boolean }
  | { kind: "emoji"; char: string; aspect: number };

const SHAPE_RENDERS: Record<ShapeName, ShapeRender> = {
  // Demon — jagged thorny spike pointing outward, dark blood-red gradient with black tip
  flame: {
    kind: "svg",
    viewBox: "0 0 14 32",
    aspect: 32 / 14,
    path: "M7,0 L10,8 L8,12 L12,18 L9,22 L11,30 L7,28 L3,30 L5,22 L2,18 L6,12 L4,8 Z",
    useGradient: true,
  },
  star: {
    kind: "svg",
    viewBox: "0 0 20 20",
    aspect: 1,
    path: "M10,0 L12.4,7.6 L20,10 L12.4,12.4 L10,20 L7.6,12.4 L0,10 L7.6,7.6 Z",
    useGradient: false,
  },
  ray: {
    kind: "svg",
    viewBox: "0 0 6 30",
    aspect: 5,
    path: "M3,0 L5,15 L3,30 L1,15 Z",
    useGradient: true,
  },
};

interface SpriteProps {
  config: ShapeConfig;
  theme: PremiumTheme;
  angle: number;
  tileSize: number;
  index: number;
  inset: boolean;
  animate: boolean;
}

function ShapeSprite({ config, theme, angle, tileSize, index, inset, animate }: SpriteProps) {
  const scale = useSharedValue(animate ? config.scaleFrom : (config.scaleFrom + config.scaleTo) / 2);
  const opacity = useSharedValue(animate ? config.opacityFrom : (config.opacityFrom + config.opacityTo) / 2);

  const delay = useMemo(() => {
    const seed = (index * 0.6180339887) % 1;
    return seed * config.period * config.jitter;
  }, [index, config.period, config.jitter]);

  const deferred = useDeferredAnimation();
  useEffect(() => {
    if (!animate || !deferred) return;
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(config.scaleTo, { duration: config.period, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(config.opacityTo, { duration: config.period, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      ),
    );
    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, [animate, deferred]);

  const render = SHAPE_RENDERS[config.shape];
  const w = Math.max(config.minSize, tileSize * config.sizeRatio);
  const h = w * render.aspect;
  // inset: shapes orbit right at the tile edge so they don't extend much beyond
  const effectiveOffsetRatio = inset ? -0.04 : config.offsetRatio;
  const radius = tileSize / 2 + tileSize * effectiveOffsetRatio;
  const rad = (angle * Math.PI) / 180;
  const cx = tileSize / 2 + Math.cos(rad) * radius;
  const cy = tileSize / 2 + Math.sin(rad) * radius;
  const rotation = config.pointOutward ? angle + 90 : 0;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation}deg` }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: "absolute", top: cy - h / 2, left: cx - w / 2, width: w, height: h, alignItems: "center", justifyContent: "center" },
        animatedStyle,
      ]}
    >
      {render.kind === "emoji" ? (
        <Text style={{ fontSize: w, lineHeight: w * 1.15 }}>{render.char}</Text>
      ) : (
        <Svg width={w} height={h} viewBox={render.viewBox}>
          {render.useGradient && (
            <Defs>
              <SvgLinearGradient id={`sprite-${config.shape}-${index}-${tileSize}`} x1="0.5" y1="1" x2="0.5" y2="0">
                <Stop offset="0%" stopColor={theme.borderGradient[1]} stopOpacity="0.95" />
                <Stop offset="55%" stopColor={theme.haloColor} stopOpacity="1" />
                <Stop offset="100%" stopColor={theme.haloAccent} stopOpacity="0.85" />
              </SvgLinearGradient>
            </Defs>
          )}
          <Path
            d={render.path}
            fill={
              render.useGradient
                ? `url(#sprite-${config.shape}-${index}-${tileSize})`
                : theme.haloColor
            }
          />
        </Svg>
      )}
    </Animated.View>
  );
}

interface Props {
  entitlement: EntitlementKey;
  size: number;
  /** When true, shapes orbit at the tile edge (compact contexts: profile, leaderboard, home) */
  inset?: boolean;
  /** When false, render shapes statically (no infinite loops) — used in lists/cards */
  animate?: boolean;
}

/**
 * Themed shape burst around a premium tile.
 * - Crown: 6 gold stars rotating slowly around the tile
 * - Angel: 8 ivory light rays radiating outward, gentle pulse
 * - Demon: 8 dark spikes pulsing menacingly outward
 */
export function ShapeAura({ entitlement, size, inset = false, animate = true }: Props) {
  const config = CONFIGS[entitlement];
  const theme = getPremiumTheme(entitlement);
  const rotation = useSharedValue(0);
  const deferred = useDeferredAnimation();

  useEffect(() => {
    if (animate && deferred && config?.rotateAssembly) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 14000, easing: Easing.linear }),
        -1,
        false,
      );
      return () => {
        cancelAnimation(rotation);
      };
    }
  }, [animate, deferred, config?.rotateAssembly]);

  const assemblyStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const angles = useMemo(
    () =>
      config
        ? Array.from({ length: config.count }, (_, i) => (i / config.count) * 360 - 90)
        : [],
    [config],
  );

  if (!config || !theme) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: "absolute", top: 0, left: 0, width: size, height: size },
        assemblyStyle,
      ]}
    >
      {angles.map((angle, i) => (
        <ShapeSprite
          key={i}
          config={config}
          theme={theme}
          angle={angle}
          tileSize={size}
          index={i}
          inset={inset}
          animate={animate}
        />
      ))}
    </Animated.View>
  );
}
