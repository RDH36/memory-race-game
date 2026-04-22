import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/ThemeContext";

interface BotSelectCardProps {
  botKey: "easy" | "medium" | "hard";
  name: string;
  avatar: string;
  color: string;
  pairs: number;
  power: number;
  index: number;
  loading: string | null;
  onPress: () => void;
}

export function BotSelectCard({
  botKey,
  name,
  avatar,
  color,
  pairs,
  power,
  index,
  loading,
  onPress,
}: BotSelectCardProps) {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const isThis = loading === botKey;
  const isOther = loading !== null && !isThis;

  const powerDots = 3;
  const filledDots = botKey === "easy" ? 1 : botKey === "medium" ? 2 : 3;

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(350)}>
      <Pressable
        onPress={onPress}
        disabled={loading !== null}
        style={({ pressed }) => ({
          opacity: isOther ? 0.35 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        })}
      >
        <View
          style={{
            backgroundColor: isDark ? colors.surfaceContainerHigh : colors.surfaceContainer,
            borderRadius: 16,
            borderLeftWidth: 4,
            borderLeftColor: color,
            overflow: "hidden",
          }}
        >
          {/* Top row: avatar + info */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 12,
              gap: 14,
            }}
          >
            {/* Avatar circle */}
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: color + "18",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 30 }}>{avatar}</Text>
            </View>

            {/* Name + difficulty */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Fredoka_700Bold",
                  color: color,
                }}
              >
                {name}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Nunito_600SemiBold",
                  color: colors.onSurfaceVariant,
                  marginTop: 2,
                }}
              >
                {t(`home.difficulty.${botKey}`)} · {t(`home.difficulty.${botKey}Desc`)}
              </Text>
            </View>

            {/* Loading or arrow */}
            {isThis ? (
              <Text style={{ fontSize: 20 }}>⏳</Text>
            ) : (
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: color + "14",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 16, color, fontFamily: "Fredoka_700Bold" }}>{">"}</Text>
              </View>
            )}
          </View>

          {/* Stats bar */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: color + "0A",
              paddingHorizontal: 16,
              paddingVertical: 10,
              gap: 20,
            }}
          >
            {/* Pairs */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 13 }}>🃏</Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Nunito_700Bold",
                  color: colors.onSurfaceVariant,
                }}
              >
                {pairs} {t("home.botModal.pairs")}
              </Text>
            </View>

            {/* Power dots */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 13 }}>⚡</Text>
              <View style={{ flexDirection: "row", gap: 3, alignItems: "center" }}>
                {Array.from({ length: powerDots }).map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: i < filledDots ? color : (isDark ? "#444" : "#E0DDE8"),
                    }}
                  />
                ))}
              </View>
            </View>

            {/* Tornado */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 13 }}>🌪️</Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Nunito_700Bold",
                  color: colors.onSurfaceVariant,
                }}
              >
                1x
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
