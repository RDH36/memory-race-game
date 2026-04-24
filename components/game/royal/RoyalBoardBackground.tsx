import { View } from "react-native";
import { ROYAL_THEME } from "../../../lib/skins";
import { Crown } from "../../ui/icons/Crown";
import { RoyalSparkles } from "./RoyalSparkles";

interface Props {
  children: React.ReactNode;
  sparkles?: "off" | "low" | "medium" | "high";
}

const t = ROYAL_THEME;

/**
 * Royal board chrome — full-width via negative positioning + rounded corners
 * + gold crowns at the top corners. Cards inside render in their normal position.
 */
export function RoyalBoardBackground({ children, sparkles = "medium" }: Props) {
  return (
    <View style={{ flex: 1 }}>
      {/* Clipped rounded bg + decorative borders */}
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
        {/* Top gold double-line border */}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: t.gold }} />
        <View style={{ position: "absolute", top: 6, left: 0, right: 0, height: 1, backgroundColor: t.gold + "66" }} />
        {/* Bottom gold double-line border */}
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, backgroundColor: t.gold }} />
        <View style={{ position: "absolute", bottom: 6, left: 0, right: 0, height: 1, backgroundColor: t.gold + "66" }} />
      </View>

      {/* Crowns at top corners (rendered outside the clip so they sit on top) */}
      <View pointerEvents="none" style={{ position: "absolute", top: -10, left: -10, transform: [{ rotate: "-15deg" }] }}>
        <Crown size={26} color={t.gold} />
      </View>
      <View pointerEvents="none" style={{ position: "absolute", top: -10, right: -10, transform: [{ rotate: "15deg" }] }}>
        <Crown size={26} color={t.gold} />
      </View>

      {sparkles !== "off" && <RoyalSparkles density={sparkles} />}
      {children}
    </View>
  );
}
