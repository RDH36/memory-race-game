import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../lib/ThemeContext";
import type { HueName } from "../../components/ui/theme";
import { Angel } from "../ui/icons/Angel";
import { Demon } from "../ui/icons/Demon";
import { MiniCardFace } from "./MiniCard";
import { ShapeAura } from "../appearance/ShapeAura";
import { ENTITLEMENT } from "../../lib/revenuecat";

export type PackIconKind = "angel" | "demon";

export interface MiniCardSpec {
  symbol: string;
  color: string;
  rotate: number;
}

interface Props {
  iconType: PackIconKind;
  gradient: [string, string];
  miniCards: [MiniCardSpec, MiniCardSpec, MiniCardSpec];
  title: string;
  count: string;
  description: string;
  badge?: string;
  ctaLabel: string;
  price: string;
  ownedLabel: string;
  owned?: boolean;
  onPress: () => void;
  style?: { marginBottom?: number };
}

export function PackCard({
  iconType, miniCards, title, count, description,
  badge, ctaLabel, price, ownedLabel, owned, onPress, style,
}: Props) {
  const { colors } = useTheme();
  const Icon = iconType === "angel" ? Angel : Demon;
  const entitlement = iconType === "angel" ? ENTITLEMENT.PACK_ANGEL : ENTITLEMENT.PACK_DEMON;
  const auraSize = 96;

  // Solid header color (no gradient) per pack identity.
  const headerHue: HueName = iconType === "angel" ? "blue" : "coral";
  const [headerColor] = colors.hues[headerHue];

  // Chunky CTA hue.
  const ctaHue: HueName = owned ? "green" : "violet";
  const [ctaBase, ctaLip] = colors.hues[ctaHue];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
        marginBottom: style?.marginBottom ?? 14,
        borderRadius: 22,
        boxShadow: `0 4px 0 ${colors.panelLip}, 0 14px 28px -14px ${colors.panelShadow}`,
      })}
    >
      <View
        style={{
          backgroundColor: colors.surfaceContainer,
          borderRadius: 22,
          overflow: "hidden",
        }}
      >
        {/* Header — solid color zone */}
        <View
          style={{
            height: 110,
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: 22,
            backgroundColor: headerColor,
            overflow: "hidden",
          }}
        >
          <View style={{ width: auraSize, height: auraSize, alignItems: "center", justifyContent: "center" }}>
            <ShapeAura entitlement={entitlement} size={auraSize} animate={false} />
            <Icon size={64} color="#FFFFFF" />
          </View>

          {/* Mini cards cluster */}
          <View style={{ position: "absolute", right: 14, top: 22, flexDirection: "row" }}>
            {miniCards.map((c, i) => (
              <MiniCardFace
                key={i}
                width={28}
                symbol={c.symbol}
                color={c.color}
                rotate={c.rotate}
                style={i < miniCards.length - 1 ? { marginRight: -8 } : undefined}
              />
            ))}
          </View>
        </View>

        {/* Content zone */}
        <View style={{ paddingTop: 16, paddingHorizontal: 18, paddingBottom: 18 }}>
          <View style={{ marginBottom: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text
                numberOfLines={1}
                style={{ fontFamily: "Fredoka_700Bold", fontSize: 17, color: colors.onSurface }}
              >
                {title}
              </Text>
              {badge && (
                <View
                  style={{
                    backgroundColor: colors.hues.coral[0],
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 8,
                    boxShadow: `0 2px 0 ${colors.hues.coral[1]}`,
                  }}
                >
                  <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 9, letterSpacing: 0.5, color: "#fff" }}>
                    {badge}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={{ fontFamily: "Fredoka_700Bold", fontSize: 11, letterSpacing: 0.3, color: colors.onSurfaceMuted }}
            >
              {count}
            </Text>
          </View>

          <Text
            style={{
              fontFamily: "Fredoka_700Bold",
              fontSize: 12,
              lineHeight: 16.8,
              color: colors.onSurfaceMuted,
              marginBottom: 16,
            }}
          >
            {description}
          </Text>

          {/* Chunky CTA — visual only (outer Pressable handles the tap) */}
          <View
            style={{
              backgroundColor: ctaBase,
              borderRadius: 14,
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: `0 4px 0 ${ctaLip}`,
              overflow: "hidden",
            }}
          >
            {/* gloss */}
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: "6%",
                right: "6%",
                top: 5,
                height: "32%",
                borderRadius: 999,
                backgroundColor: "#FFFFFF52",
              }}
            />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 }}>
              <Ionicons name={owned ? "checkmark-circle" : "bag"} size={18} color="#FFFFFF" />
              <Text
                numberOfLines={1}
                style={{ fontFamily: "Fredoka_700Bold", fontSize: 15, color: "#FFFFFF" }}
              >
                {owned ? ownedLabel : ctaLabel}
              </Text>
            </View>
            {!owned && (
              <View
                style={{
                  backgroundColor: "#FFFFFF38",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 10,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{ fontFamily: "Fredoka_700Bold", fontSize: 13, color: "#FFFFFF" }}
                >
                  {price}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
