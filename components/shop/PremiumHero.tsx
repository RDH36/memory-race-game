import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Crown } from "../ui/icons/Crown";
import { Sparkle } from "../ui/icons/Sparkle";
import { MiniCardFace, MiniCardBack } from "./MiniCard";
import { StrikePrice } from "./StrikePrice";

interface Props {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  price: string;
  /** Crossed-out pre-discount price (hidden when null). */
  originalPrice?: string | null;
  owned?: boolean;
  ownedLabel: string;
  onPress: () => void;
}

export function PremiumHero({
  eyebrow, title, subtitle, cta, price, originalPrice, owned, ownedLabel, onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.99 : 1 }],
        borderRadius: 28,
        boxShadow: "0 5px 0 #4A2BC0, 0 18px 32px -14px #6C4CF1A6",
      })}
    >
      <View style={{ borderRadius: 28, overflow: "hidden", minHeight: 340, backgroundColor: "#6C4CF1" }}>
          {/* Cards showcase row — 4 overlapping, rotated. Star aura orbits behind. */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 24,
              paddingBottom: 4,
              position: "relative",
            }}
          >
            {/* Star aura disabled here for perf — 3 packs render simultaneously on shop tab.
                The PackCard auras provide enough premium feel. */}
            <MiniCardFace
              width={56}
              symbol="✦"
              color="#5DA9FE"
              rotate={-16}
              style={{ marginRight: -10 }}
            />
            <MiniCardFace
              width={62}
              symbol="♛"
              color="#FFD366"
              rotate={-4}
              style={{
                marginRight: -10,
                zIndex: 2,
              }}
            />
            <MiniCardBack
              width={62}
              bg="#FFD366"
              pattern="#3B309E"
              rotate={8}
              style={{ marginRight: -10 }}
            />
            <MiniCardFace width={56} symbol="♆" color="#A2340A" rotate={18} />
          </View>

          {/* Floating sparkles */}
          <View style={{ position: "absolute", top: 38, left: 28 }}>
            <Sparkle size={14} color="#FFD366" />
          </View>
          <View style={{ position: "absolute", top: 92, right: 34 }}>
            <Sparkle size={10} color="#FFD366" />
          </View>
          <View style={{ position: "absolute", top: 28, right: 48 }}>
            <Sparkle size={8} color="rgba(255,255,255,0.8)" />
          </View>

          {/* Content block */}
          <View style={{ paddingTop: 20, paddingHorizontal: 22, paddingBottom: 22 }}>
            {/* Eyebrow badge */}
            <View
              style={{
                alignSelf: "flex-start",
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: "rgba(255, 211, 102, 0.16)",
                paddingHorizontal: 11,
                paddingVertical: 5,
                borderRadius: 999,
                marginBottom: 10,
              }}
            >
              <Crown size={12} color="#FFD366" />
              <Text
                style={{
                  fontFamily: "Nunito_700Bold",
                  fontSize: 10,
                  letterSpacing: 1.3,
                  color: "#FFD366",
                  textTransform: "uppercase",
                }}
              >
                {eyebrow}
              </Text>
            </View>

            <Text
              style={{
                fontFamily: "Fredoka_700Bold",
                fontSize: 30,
                lineHeight: 31.5,
                letterSpacing: -0.6,
                color: "#FFFFFF",
                marginBottom: 6,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                fontFamily: "Nunito_600SemiBold",
                fontSize: 13,
                lineHeight: 18.85,
                color: "rgba(255,255,255,0.78)",
                marginBottom: 18,
                maxWidth: "90%",
              }}
            >
              {subtitle}
            </Text>

            {/* White CTA — visual only (parent Pressable handles tap) */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 }}>
                <Ionicons name="bag" size={18} color="#3B309E" />
                <Text
                  numberOfLines={1}
                  style={{ fontFamily: "Fredoka_700Bold", fontSize: 15, color: "#3B309E" }}
                >
                  {owned ? ownedLabel : cta}
                </Text>
              </View>
              {!owned && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  {originalPrice && <StrikePrice value={originalPrice} size={13} color="#9A93C4" />}
                  <View
                    style={{
                      backgroundColor: "#F0EDFB",
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 10,
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{ fontFamily: "Fredoka_700Bold", fontSize: 13, color: "#3B309E" }}
                    >
                      {price}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
      </View>
    </Pressable>
  );
}
