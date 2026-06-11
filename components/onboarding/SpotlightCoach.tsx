import { useEffect, useRef, useState, type RefObject } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import type { HueName } from "@/components/ui/theme";
import { HandPointer } from "./HandPointer";

type Rect = { x: number; y: number; w: number; h: number };

// Oversize the dim plate beyond the window metrics (Android nav bar etc.).
const PAD = 160;
const HOLE_RADIUS = 24;
const HOLE_INSET = 8;

/**
 * Mobile-game style tutorial spotlight: dims the whole screen except a
 * rounded cutout around the measured target, with a tap-here finger and a
 * coach bubble. Tapping the lit zone (or the bubble) runs `onPressTarget`
 * (falls back to dismiss); tapping the dark area dismisses.
 *
 * Render it as the LAST child of the screen's SafeAreaView (top edge).
 */
export function SpotlightCoach({
  targetRef,
  text,
  hue = "violet",
  onDismiss,
  onPressTarget,
}: {
  targetRef: RefObject<View | null>;
  text: string;
  hue?: HueName;
  onDismiss: () => void;
  onPressTarget?: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [base, lip] = colors.hues[hue];
  const [rect, setRect] = useState<Rect | null>(null);
  const rootRef = useRef<View>(null);

  // Device-proof measurement. Target AND overlay are measured in the same
  // window coords then subtracted (no status-bar / edge-to-edge assumption),
  // and the cutout only commits once two consecutive measures agree — i.e.
  // every entrance animation has truly settled, however fast the device is.
  useEffect(() => {
    let prev: Rect | null = null;
    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      rootRef.current?.measureInWindow((ox, oy) => {
        targetRef.current?.measureInWindow((x, y, w, h) => {
          if (w <= 0 || h <= 0) return;
          const next = { x: x - ox, y: y - oy, w, h };
          const stable =
            prev !== null &&
            Math.abs(prev.x - next.x) < 1 &&
            Math.abs(prev.y - next.y) < 1 &&
            Math.abs(prev.w - next.w) < 1 &&
            Math.abs(prev.h - next.h) < 1;
          // Cap as a safety net if something keeps animating forever.
          if (stable || tries > 20) {
            clearInterval(id);
            setRect(next);
          }
          prev = next;
        });
      });
    }, 160);
    return () => clearInterval(id);
  }, []);

  const hole = rect
    ? {
        x: rect.x - HOLE_INSET,
        y: rect.y - HOLE_INSET,
        w: rect.w + HOLE_INSET * 2,
        h: rect.h + HOLE_INSET * 2,
      }
    : null;

  if (!hole) return <View ref={rootRef} collapsable={false} style={StyleSheet.absoluteFill} pointerEvents="none" />;

  const W = width + PAD * 2;
  const H = height + PAD * 2;
  const hx = hole.x + PAD;
  const hy = hole.y + PAD;
  const r = HOLE_RADIUS;
  const plate = `M0 0H${W}V${H}H0Z`;
  const cutout =
    `M${hx + r} ${hy} H${hx + hole.w - r} A${r} ${r} 0 0 1 ${hx + hole.w} ${hy + r} ` +
    `V${hy + hole.h - r} A${r} ${r} 0 0 1 ${hx + hole.w - r} ${hy + hole.h} ` +
    `H${hx + r} A${r} ${r} 0 0 1 ${hx} ${hy + hole.h - r} V${hy + r} A${r} ${r} 0 0 1 ${hx + r} ${hy}Z`;

  const handleTarget = onPressTarget ?? onDismiss;

  return (
    <View ref={rootRef} collapsable={false} style={[StyleSheet.absoluteFill, { zIndex: 100 }]}>
      <Animated.View entering={FadeIn.duration(250)} style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}>
        <Svg width={W} height={H} style={{ position: "absolute", left: -PAD, top: -PAD }}>
          <Path d={`${plate} ${cutout}`} fill="rgba(5,6,15,0.78)" fillRule="evenodd" />
        </Svg>
      </Animated.View>

      {/* Dark area dismisses */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />

      {/* The lit zone is tappable */}
      <Pressable
        onPress={handleTarget}
        style={{ position: "absolute", left: hole.x, top: hole.y, width: hole.w, height: hole.h, borderRadius: r }}
      />

      {/* Finger + coach bubble under the cutout */}
      <Animated.View
        entering={FadeIn.delay(250).duration(250)}
        style={{ position: "absolute", top: hole.y + hole.h + 4, left: 0, right: 0, alignItems: "center" }}
      >
        <HandPointer pointing="up" size={32} style={{ marginBottom: 24 }} />
        <Pressable
          onPress={handleTarget}
          style={{
            maxWidth: 300,
            backgroundColor: base,
            borderRadius: 18,
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginTop: 48,
            boxShadow: `0 4px 0 ${lip}`,
          }}
        >
          <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 14.5, color: "#fff", textAlign: "center" }}>
            {text}
          </Text>
          <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 11, color: "rgba(255,255,255,0.85)", textAlign: "center", marginTop: 4 }}>
            {t("onboarding.coach.tap")}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
