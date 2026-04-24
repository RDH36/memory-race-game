import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ROYAL_THEME, INFERNO_THEME, HEAVEN_THEME, type CardSkin } from "../../lib/skins";
import { RoyalSealIcon } from "../game/royal/RoyalSealIcon";
import { GoeticSigil } from "../game/inferno/GoeticSigil";
import { CelticCross } from "../game/heaven/CelticCross";

interface Props {
  frame: string;
  back: string;
  face: string;
  locked?: boolean;
  skin?: CardSkin;
}

/**
 * Skin-aware mini board preview — frame + 3 cards (back/face/back) with the
 * skin's signature sigil on the back cards + thematic top/bottom strips.
 */
export function TableMiniPreview({ frame, back, face, locked, skin = "classic" }: Props) {
  const stripColor = stripFor(skin);

  return (
    <View
      style={{
        backgroundColor: frame,
        borderRadius: 12,
        aspectRatio: 1.4,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Top + bottom thematic strips (thin) */}
      {stripColor && (
        <>
          <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, backgroundColor: stripColor }} />
          <View pointerEvents="none" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: stripColor }} />
        </>
      )}

      <MiniCard width={22} bg={back} face={false} skin={skin} />
      <MiniCard width={22} bg={face} face={true} locked={locked} skin={skin} />
      <MiniCard width={22} bg={back} face={false} skin={skin} />
    </View>
  );
}

interface CardProps {
  width: number;
  bg: string;
  face: boolean;
  locked?: boolean;
  skin: CardSkin;
}

function MiniCard({ width, bg, face, locked, skin }: CardProps) {
  const h = width * 1.4;
  const sigilSize = width * 0.65;

  return (
    <View
      style={{
        width,
        height: h,
        borderRadius: skin === "inferno" ? 2 : skin === "heaven" ? 5 : 4,
        backgroundColor: bg,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: skinBorderWidth(skin),
        borderColor: skinBorderColor(skin),
      }}
    >
      {/* Sigil on back cards only */}
      {!face && skin === "royal" && (
        <RoyalSealIcon size={sigilSize} color={ROYAL_THEME.gold} accent={ROYAL_THEME.goldBright} />
      )}
      {!face && skin === "inferno" && (
        <GoeticSigil size={sigilSize} color={INFERNO_THEME.ember} accent={INFERNO_THEME.emberBright} />
      )}
      {!face && skin === "heaven" && (
        <CelticCross size={sigilSize} color={HEAVEN_THEME.haloDeep} accent={HEAVEN_THEME.gold} />
      )}
      {/* Classic back: subtle white inner border (no sigil) */}
      {!face && skin === "classic" && (
        <View
          style={{
            position: "absolute",
            top: 2.5, left: 2.5, right: 2.5, bottom: 2.5,
            borderRadius: 3,
            borderWidth: 1.2,
            borderColor: "rgba(255,255,255,0.25)",
          }}
        />
      )}
      {/* Locked overlay on face card */}
      {locked && face && (
        <View
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="lock-closed" size={width * 0.42} color={lockColor(skin)} />
        </View>
      )}
    </View>
  );
}

function stripFor(skin: CardSkin): string | null {
  if (skin === "royal") return ROYAL_THEME.gold;
  if (skin === "inferno") return INFERNO_THEME.ember;
  if (skin === "heaven") return HEAVEN_THEME.gold;
  return null;
}

function skinBorderWidth(skin: CardSkin): number {
  if (skin === "classic") return 0;
  return 0.6;
}

function skinBorderColor(skin: CardSkin): string {
  if (skin === "royal") return ROYAL_THEME.goldDeep;
  if (skin === "inferno") return INFERNO_THEME.ink;
  if (skin === "heaven") return HEAVEN_THEME.gold;
  return "transparent";
}

function lockColor(skin: CardSkin): string {
  if (skin === "inferno") return INFERNO_THEME.emberBright;
  if (skin === "royal") return ROYAL_THEME.gold;
  if (skin === "heaven") return HEAVEN_THEME.gold;
  return "#FFD366";
}
