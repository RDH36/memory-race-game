import { useEffect } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Extra coverage beyond the window metrics — absorbs the Android system
// navigation bar / edge-to-edge mismatch without measuring (a layout-driven
// resize of the SVG canvas causes a visible blink).
const PAD = 160;

function irisPath(w: number, h: number, r: number) {
  "worklet";
  const cx = w / 2;
  const cy = h / 2;
  // Full plate + circular hole (two arcs), even-odd fill rule.
  return `M0 0H${w}V${h}H0Z M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0Z`;
}

type Props = {
  /** Color the screen closes into — match the destination background. */
  color?: string;
  duration?: number;
  /** "out": the iris closes to black. "in": the iris opens from the center. */
  mode?: "out" | "in";
  onDone: () => void;
};

/**
 * Cartoon-style iris transition, drawn as an SVG plate with a circular hole
 * (even-odd fill) whose radius animates. "out": the hole shrinks from
 * beyond the corners down to nothing — the classic iris-close (navigate in
 * `onDone` while all-black). "in": the hole grows from the center until the
 * screen is fully revealed (unmount in `onDone`).
 */
export function IrisTransition({ color = "#05060F", duration = 700, mode = "out", onDone }: Props) {
  const win = useWindowDimensions();
  const w = win.width + PAD * 2;
  const h = win.height + PAD * 2;
  const maxR = Math.ceil(Math.hypot(w, h) / 2) + 30;

  // 1 = iris fully open, 0 = fully closed.
  const openness = useSharedValue(mode === "in" ? 0 : 1);

  useEffect(() => {
    openness.value = withTiming(
      mode === "in" ? 1 : 0,
      { duration, easing: mode === "in" ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(onDone)();
      },
    );
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    d: irisPath(w, h, Math.max(openness.value * maxR, 0)),
  }));

  return (
    <View pointerEvents="auto" style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}>
      <Svg
        width={w}
        height={h}
        style={{ position: "absolute", left: -PAD, top: -PAD }}
      >
        {/* Static initial path keeps the very first frame correct (no flash)
            until the animated props take over. */}
        <AnimatedPath
          d={irisPath(w, h, mode === "in" ? 0 : maxR)}
          animatedProps={animatedProps}
          fill={color}
          fillRule="evenodd"
        />
      </Svg>
    </View>
  );
}
