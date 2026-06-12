import { useEffect, useRef, useState, type RefObject } from "react";
import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import type { HueName } from "@/components/ui/theme";
import { HandPointer } from "./HandPointer";

type Rect = { x: number; y: number; w: number; h: number };

// Oversize the dim plate beyond the window metrics (Android nav bar etc.).
const PAD = 160;
const HOLE_RADIUS = 24;
const HOLE_INSET = 8;
const TAB_BAR_HEIGHT = 56;

/** OK pill + coach bubble — OK is the ONLY way to close the tour step.
 *  The pill is a statically-styled inner View (style-function + boxShadow
 *  on Pressable silently fails to render on some devices). */
function CoachRow({ text, base, lip, onOk }: { text: string; base: string; lip: string; onOk: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20 }}>
      <Pressable onPress={onOk} hitSlop={8}>
        {({ pressed }) => (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 3,
              borderBottomColor: lip,
              transform: [{ translateY: pressed ? 2 : 0 }],
            }}
          >
            <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 14, color: base }}>
              {t("onboarding.coach.ok")}
            </Text>
          </View>
        )}
      </Pressable>
      <View
        style={{
          flexShrink: 1,
          maxWidth: 280,
          backgroundColor: base,
          borderRadius: 18,
          paddingVertical: 12,
          paddingHorizontal: 16,
          boxShadow: `0 4px 0 ${lip}`,
        }}
      >
        <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 14.5, color: "#fff", textAlign: "center" }}>
          {text}
        </Text>
      </View>
    </View>
  );
}

/**
 * Mobile-game style tutorial spotlight: dims the whole screen except a
 * rounded cutout around the measured target. The dark area swallows taps —
 * the tour only closes via the OK pill (or by tapping the lit target, which
 * runs `onPressTarget`). With `menu`, no cutout is made: everything dims
 * and the finger points down at the floating tab bar (drawn above screens).
 *
 * Render it as the LAST child of the screen's SafeAreaView (top edge).
 */
export function SpotlightCoach({
  targetRef,
  menu = false,
  menuIndex = 0,
  text,
  hue = "violet",
  onDismiss,
  onPressTarget,
}: {
  targetRef?: RefObject<View | null>;
  menu?: boolean;
  /** Tab slot (0-4) the finger points at during the menu tour. */
  menuIndex?: number;
  text: string;
  hue?: HueName;
  onDismiss: () => void;
  onPressTarget?: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [base, lip] = colors.hues[hue];
  const [rect, setRect] = useState<Rect | null>(null);
  const rootRef = useRef<View>(null);

  const W = width + PAD * 2;
  const H = height + PAD * 2;
  const plate = `M0 0H${W}V${H}H0Z`;

  // Device-proof measurement. Target AND overlay are measured in the same
  // window coords then subtracted (no status-bar / edge-to-edge assumption),
  // and the cutout only commits once two consecutive measures agree — i.e.
  // every entrance animation has truly settled, however fast the device is.
  useEffect(() => {
    if (menu) return;
    let prev: Rect | null = null;
    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      rootRef.current?.measureInWindow((ox, oy) => {
        targetRef?.current?.measureInWindow((x, y, w, h) => {
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

  // Menu tour: rendered in a transparent Modal so the dim sits ABOVE the
  // floating tab bar. The bottom strip dims every tab slot except the
  // current one, and the finger walks the 5 slots one by one.
  if (menu) {
    const DIM = "rgba(5,6,15,0.78)";
    const slotCenter = (menuIndex + 0.5) * (width / 5);
    return (
      <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={() => {}}>
        <View style={{ flex: 1 }}>
          {/* Everything above the tab bar */}
          <Pressable style={{ flex: 1, backgroundColor: DIM }} onPress={() => {}} />
          {/* Tab bar strip: only the current slot stays lit */}
          <View style={{ height: TAB_BAR_HEIGHT + insets.bottom, flexDirection: "row" }}>
            {Array.from({ length: 5 }, (_, i) => (
              <Pressable
                key={i}
                style={{ flex: 1, backgroundColor: i === menuIndex ? "transparent" : DIM }}
                onPress={() => {}}
              />
            ))}
          </View>

          {/* Coach bubble hugging the menu, finger on the lit tab */}
          <Animated.View
            key={`menu-${menuIndex}`}
            entering={FadeIn.duration(250)}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: TAB_BAR_HEIGHT + insets.bottom + 10,
              alignItems: "center",
            }}
          >
            <CoachRow text={text} base={base} lip={lip} onOk={onDismiss} />
            <View style={{ alignSelf: "stretch", height: 44 }}>
              <HandPointer pointing="down" size={30} style={{ top: 6, left: slotCenter - 15 }} />
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  const hole = rect
    ? { x: rect.x - HOLE_INSET, y: rect.y - HOLE_INSET, w: rect.w + HOLE_INSET * 2, h: rect.h + HOLE_INSET * 2 }
    : null;

  if (!hole) return <View ref={rootRef} collapsable={false} style={StyleSheet.absoluteFill} pointerEvents="none" />;

  const r = HOLE_RADIUS;
  const hx = hole.x + PAD;
  const hy = hole.y + PAD;
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

      {/* Dark area swallows taps — only OK (or the target) moves the tour on */}
      <Pressable style={StyleSheet.absoluteFill} onPress={() => {}} />

      {/* The lit zone is tappable */}
      <Pressable
        onPress={handleTarget}
        style={{ position: "absolute", left: hole.x, top: hole.y, width: hole.w, height: hole.h, borderRadius: r }}
      />

      {/* Finger + OK + coach bubble under the cutout */}
      <Animated.View
        entering={FadeIn.delay(250).duration(250)}
        style={{ position: "absolute", top: hole.y + hole.h + 4, left: 0, right: 0, alignItems: "center" }}
      >
        <HandPointer pointing="up" size={32} style={{ marginBottom: 24 }} />
        <View style={{ marginTop: 48 }}>
          <CoachRow text={text} base={base} lip={lip} onOk={onDismiss} />
        </View>
      </Animated.View>
    </View>
  );
}
