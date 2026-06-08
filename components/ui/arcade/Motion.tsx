// Motion — simple enter/press animations on react-native-ease.
// Single import point for the native animation engine so the rest
// of the app stays decoupled from the library.
import React from "react";
import type { ViewStyle, StyleProp } from "react-native";
import { EaseView } from "react-native-ease";
import type { AnimateProps, Transition } from "react-native-ease";

type MotionProps = {
  children?: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

const SPRING: Transition = { type: "spring", damping: 14, stiffness: 170 };
const EASE_OUT: Transition = {
  type: "timing",
  duration: 420,
  easing: [0.2, 0.8, 0.2, 1],
};

function Enter({
  children,
  delay = 0,
  style,
  from,
  to,
  transition,
}: MotionProps & {
  from: AnimateProps;
  to: AnimateProps;
  transition: Transition;
}) {
  const t = delay
    ? ({ ...transition, delay } as Transition)
    : transition;
  return (
    <EaseView initialAnimate={from} animate={to} transition={t} style={style}>
      {children}
    </EaseView>
  );
}

/** Slide up + fade in. The workhorse entry. */
export function Rise(props: MotionProps) {
  return (
    <Enter
      {...props}
      from={{ translateY: 16, opacity: 0 }}
      to={{ translateY: 0, opacity: 1 }}
      transition={EASE_OUT}
    />
  );
}

/** Pop in with an overshoot — for badges, rewards, hero CTAs. */
export function Pop(props: MotionProps) {
  return (
    <Enter
      {...props}
      from={{ scale: 0.6, opacity: 0 }}
      to={{ scale: 1, opacity: 1 }}
      transition={SPRING}
    />
  );
}

/** Drop from above with a bounce — heroes, mascots, VS fighters. */
export function Drop(props: MotionProps) {
  return (
    <Enter
      {...props}
      from={{ translateY: -22, scale: 0.92, opacity: 0 }}
      to={{ translateY: 0, scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 12, stiffness: 150 }}
    />
  );
}

/** Generic animated view (for live, value-driven animations). */
export { EaseView as MotionView };
export type { AnimateProps, Transition };
