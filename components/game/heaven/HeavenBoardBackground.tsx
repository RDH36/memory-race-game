import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { HEAVEN_THEME } from "../../../lib/skins";
import { HeavenHalo } from "./HeavenHalo";
import { HeavenParticles } from "./HeavenParticles";

interface Props {
  children: React.ReactNode;
  particles?: "off" | "low" | "medium" | "high";
}

const t = HEAVEN_THEME;

/**
 * Heaven board chrome — full-width via negative positioning + rounded corners
 * + halos at top corners + soft marble veins + cloud bumps along borders.
 */
export function HeavenBoardBackground({ children, particles = "low" }: Props) {
  return (
    <View style={{ flex: 1 }}>
      {/* Clipped rounded bg + decorative borders + marble veins */}
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
        {/* Soft top halo glow */}
        <View
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: 80,
            backgroundColor: t.gold,
            opacity: 0.05,
          }}
        />

        {/* Marble veins — soft gold curves across the table */}
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {/* Long horizontal vein top */}
          <Path d="M -3 18 Q 20 14 38 24 Q 58 36 78 28 Q 95 22 105 26" stroke={t.haloDeep} strokeWidth={0.5} fill="none" opacity={0.4} strokeLinecap="round" />
          {/* Long horizontal vein bottom */}
          <Path d="M -3 70 Q 22 64 45 76 Q 68 86 90 74 Q 100 70 105 72" stroke={t.haloDeep} strokeWidth={0.5} fill="none" opacity={0.4} strokeLinecap="round" />
          {/* Vertical vein left */}
          <Path d="M 22 -3 Q 26 22 20 48 Q 16 72 24 100" stroke={t.haloDeep} strokeWidth={0.45} fill="none" opacity={0.35} strokeLinecap="round" />
          {/* Vertical vein right */}
          <Path d="M 78 -3 Q 82 22 86 50 Q 84 78 80 105" stroke={t.haloDeep} strokeWidth={0.45} fill="none" opacity={0.35} strokeLinecap="round" />
          {/* Diagonal gold accent */}
          <Path d="M 5 50 Q 35 46 60 56 Q 80 64 100 60" stroke={t.gold} strokeWidth={0.4} fill="none" opacity={0.5} strokeLinecap="round" />
        </Svg>

        {/* Top gold double-line border */}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: t.gold }} />
        <View style={{ position: "absolute", top: 4, left: 0, right: 0, height: 1, backgroundColor: t.haloBright, opacity: 0.7 }} />
        <View style={{ position: "absolute", top: 6, left: 0, right: 0, height: 1, backgroundColor: t.gold + "55" }} />
        {/* Top cloud bumps — 6 soft dots along the strip */}
        <Svg
          width="100%" height="6"
          viewBox="0 0 100 6"
          preserveAspectRatio="none"
          style={{ position: "absolute", top: 9, left: 0 }}
        >
          <Path d="M8 6 Q10 0 12 6 Z" fill={t.gold} opacity={0.7} />
          <Path d="M24 6 Q26 1 28 6 Z" fill={t.gold} opacity={0.85} />
          <Path d="M40 6 Q42 0 44 6 Z" fill={t.gold} opacity={0.7} />
          <Path d="M56 6 Q58 1 60 6 Z" fill={t.gold} opacity={0.85} />
          <Path d="M72 6 Q74 0 76 6 Z" fill={t.gold} opacity={0.7} />
          <Path d="M88 6 Q90 1 92 6 Z" fill={t.gold} opacity={0.85} />
        </Svg>

        {/* Bottom gold double-line border (mirrored) */}
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, backgroundColor: t.gold }} />
        <View style={{ position: "absolute", bottom: 4, left: 0, right: 0, height: 1, backgroundColor: t.haloBright, opacity: 0.7 }} />
        <View style={{ position: "absolute", bottom: 6, left: 0, right: 0, height: 1, backgroundColor: t.gold + "55" }} />
        {/* Bottom cloud bumps (upside down) */}
        <Svg
          width="100%" height="6"
          viewBox="0 0 100 6"
          preserveAspectRatio="none"
          style={{ position: "absolute", bottom: 9, left: 0 }}
        >
          <Path d="M8 0 Q10 6 12 0 Z" fill={t.gold} opacity={0.7} />
          <Path d="M24 0 Q26 5 28 0 Z" fill={t.gold} opacity={0.85} />
          <Path d="M40 0 Q42 6 44 0 Z" fill={t.gold} opacity={0.7} />
          <Path d="M56 0 Q58 5 60 0 Z" fill={t.gold} opacity={0.85} />
          <Path d="M72 0 Q74 6 76 0 Z" fill={t.gold} opacity={0.7} />
          <Path d="M88 0 Q90 5 92 0 Z" fill={t.gold} opacity={0.85} />
        </Svg>
      </View>

      {/* Halos at top corners */}
      <View pointerEvents="none" style={{ position: "absolute", top: -10, left: -10 }}>
        <HeavenHalo size={26} />
      </View>
      <View pointerEvents="none" style={{ position: "absolute", top: -10, right: -10 }}>
        <HeavenHalo size={26} />
      </View>

      {particles !== "off" && <HeavenParticles density={particles} />}
      {children}
    </View>
  );
}
