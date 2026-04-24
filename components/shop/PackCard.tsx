import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Gradient } from "../ui/Gradient";
import { useTheme } from "../../lib/ThemeContext";
import { Angel } from "../ui/icons/Angel";
import { Demon } from "../ui/icons/Demon";
import { MiniCardFace } from "./MiniCard";

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
  iconType, gradient, miniCards, title, count, description,
  badge, ctaLabel, price, ownedLabel, owned, onPress, style,
}: Props) {
  const { colors } = useTheme();
  const Icon = iconType === "angel" ? Angel : Demon;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
        marginBottom: style?.marginBottom ?? 14,
      })}
    >
      <View
        style={{
          backgroundColor: colors.surfaceContainer,
          borderRadius: 22,
          overflow: "hidden",
        }}
      >
        {/* Header gradient zone */}
        <View
          style={{
            height: 110,
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: 22,
            overflow: "hidden",
          }}
        >
          <Gradient
            colors={gradient}
            angle={135}
            style={{ position: "absolute", inset: 0 }}
          />
          <Icon size={64} color="#FFFFFF" />

          {/* Mini cards cluster — absolute right */}
          <View
            style={{
              position: "absolute",
              right: 14,
              top: 22,
              flexDirection: "row",
            }}
          >
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
          {/* Title group */}
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
                    backgroundColor: colors.p2Bg,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Nunito_700Bold",
                      fontSize: 9,
                      letterSpacing: 0.5,
                      color: colors.p2,
                    }}
                  >
                    {badge}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={{
                fontFamily: "Nunito_700Bold",
                fontSize: 11,
                letterSpacing: 0.3,
                color: colors.onSurfaceMuted,
              }}
            >
              {count}
            </Text>
          </View>

          <Text
            style={{
              fontFamily: "Nunito_600SemiBold",
              fontSize: 12,
              lineHeight: 16.8,
              color: colors.onSurfaceMuted,
              marginBottom: 16,
            }}
          >
            {description}
          </Text>

          {/* CTA — boosted: bigger pad, shadow, separate price chip on right */}
          <View
            style={{
              backgroundColor: owned ? colors.success : colors.primaryContainer,
              borderRadius: 14,
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              shadowColor: owned ? colors.success : colors.primaryContainer,
              shadowOpacity: 0.32,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 6,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 }}>
              <Ionicons
                name={owned ? "checkmark-circle" : "bag"}
                size={18}
                color="#FFFFFF"
              />
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
                  backgroundColor: "rgba(255,255,255,0.22)",
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
