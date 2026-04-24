import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { INFERNO_THEME } from "../../../lib/skins";
import { DemonHorn } from "./DemonHorn";
import { InfernoSparks } from "./InfernoSparks";

interface Props {
  children: React.ReactNode;
  sparks?: "off" | "low" | "medium" | "high";
}

const t = INFERNO_THEME;

/**
 * Inferno board chrome — full-width via negative positioning + rounded corners
 * + demonic horns at top corners + ember cracks across the bg + dripping spikes
 * along top/bottom borders.
 */
export function InfernoBoardBackground({ children, sparks = "low" }: Props) {
  return (
    <View style={{ flex: 1 }}>
      {/* Clipped rounded bg + decorative borders + cracks */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0, bottom: 0, left: -16, right: -16,
          backgroundColor: t.frame,
          borderRadius: 24,
          overflow: "hidden",
        }}
      >
        {/* Inner ember glow at the bottom */}
        <View
          style={{
            position: "absolute",
            bottom: 4, left: 0, right: 0,
            height: 60,
            backgroundColor: t.ember,
            opacity: 0.1,
          }}
        />

        {/* Ember cracks scattered across the table — visible but subtle */}
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <Path d="M 5 12 L 16 28 L 11 48 L 22 68 L 18 88" stroke={t.ember} strokeWidth={0.8} fill="none" opacity={0.65} strokeLinejoin="round" strokeLinecap="round" />
          <Path d="M 78 8 L 90 22 L 84 36" stroke={t.ember} strokeWidth={0.7} fill="none" opacity={0.6} strokeLinecap="round" />
          <Path d="M 38 72 L 52 86 L 45 96" stroke={t.ember} strokeWidth={0.7} fill="none" opacity={0.55} strokeLinecap="round" />
          <Path d="M 94 48 L 82 60 L 90 76" stroke={t.ember} strokeWidth={0.7} fill="none" opacity={0.6} strokeLinecap="round" />
          <Path d="M 45 40 L 60 42 L 70 38" stroke={t.ember} strokeWidth={0.55} fill="none" opacity={0.5} strokeLinecap="round" />
        </Svg>

        {/* Top demonic ember strip + glow trail */}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, backgroundColor: t.ember }} />
        <View style={{ position: "absolute", top: 4, left: 0, right: 0, height: 1, backgroundColor: t.emberBright, opacity: 0.6 }} />
        <View style={{ position: "absolute", top: 5, left: 0, right: 0, height: 8, backgroundColor: t.emberDeep, opacity: 0.7 }} />
        {/* Top dripping spikes — pointing down, like blood drops */}
        <Svg
          width="100%" height="9"
          viewBox="0 0 100 9"
          preserveAspectRatio="none"
          style={{ position: "absolute", top: 13, left: 0 }}
        >
          <Path d="M5 0 L6.5 8 L8 0 Z" fill={t.ember} />
          <Path d="M19 0 L21 6 L23 0 Z" fill={t.ember} opacity={0.85} />
          <Path d="M34 0 L35.5 9 L37 0 Z" fill={t.ember} />
          <Path d="M50 0 L52 7 L54 0 Z" fill={t.ember} opacity={0.85} />
          <Path d="M65 0 L66.5 6 L68 0 Z" fill={t.ember} />
          <Path d="M80 0 L82 8 L84 0 Z" fill={t.ember} opacity={0.85} />
          <Path d="M93 0 L94.5 7 L96 0 Z" fill={t.ember} />
        </Svg>

        {/* Bottom ember strip + glow trail (mirrored) */}
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, backgroundColor: t.ember }} />
        <View style={{ position: "absolute", bottom: 4, left: 0, right: 0, height: 1, backgroundColor: t.emberBright, opacity: 0.6 }} />
        <View style={{ position: "absolute", bottom: 5, left: 0, right: 0, height: 8, backgroundColor: t.emberDeep, opacity: 0.7 }} />
        {/* Bottom upward spikes — flame tips */}
        <Svg
          width="100%" height="9"
          viewBox="0 0 100 9"
          preserveAspectRatio="none"
          style={{ position: "absolute", bottom: 13, left: 0 }}
        >
          <Path d="M5 9 L6.5 1 L8 9 Z" fill={t.ember} />
          <Path d="M19 9 L21 3 L23 9 Z" fill={t.ember} opacity={0.85} />
          <Path d="M34 9 L35.5 0 L37 9 Z" fill={t.ember} />
          <Path d="M50 9 L52 2 L54 9 Z" fill={t.ember} opacity={0.85} />
          <Path d="M65 9 L66.5 3 L68 9 Z" fill={t.ember} />
          <Path d="M80 9 L82 1 L84 9 Z" fill={t.ember} opacity={0.85} />
          <Path d="M93 9 L94.5 2 L96 9 Z" fill={t.ember} />
        </Svg>
      </View>

      {/* Horns at top corners */}
      <View pointerEvents="none" style={{ position: "absolute", top: -16, left: -8, transform: [{ rotate: "-20deg" }] }}>
        <DemonHorn size={28} />
      </View>
      <View pointerEvents="none" style={{ position: "absolute", top: -16, right: -8, transform: [{ rotate: "20deg" }] }}>
        <DemonHorn size={28} />
      </View>

      {sparks !== "off" && <InfernoSparks density={sparks} />}
      {children}
    </View>
  );
}
