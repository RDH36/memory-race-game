import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import type { HueName } from "@/components/ui/theme";
import { Bubble } from "@/components/ui/arcade";
import { getAvatarSkin } from "@/lib/skins";
import { ShapeAura } from "@/components/appearance/ShapeAura";
import type { ChatterKind } from "./useGameChatter";

export function GameFighter({
  avatar,
  name,
  score,
  color,
  active,
  says,
  badge,
  build,
}: {
  avatar: string;
  name: string;
  score: number;
  color: HueName;
  active: boolean;
  says?: { text: string; kind: ChatterKind } | null;
  /** Persistent status chip near the avatar (e.g. 🛡️×2 shield, ❄️ frozen). */
  badge?: { icon: string; count?: number; color: HueName } | null;
  /** Equipped ability ("build") shown as a small chip. */
  build?: { emoji: string; name: string } | null;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [c, cd] = colors.hues[color];
  const auraEnt = getAvatarSkin(avatar)?.requires ?? null;

  // Bubble color reflects the message type.
  const bubbleStyle =
    says?.kind === "clash"
      ? { bg: colors.hues.coral[0], fg: "#fff" }
      : says?.kind === "encourage"
        ? { bg: colors.hues.green[0], fg: "#fff" }
        : says?.kind === "match"
          ? { bg: colors.hues.gold[0], fg: colors.onSurface }
          : { bg: undefined, fg: undefined };

  // Up/down bob (same feel as the home mascot) — bigger + faster when active.
  const bob = useSharedValue(0);
  useEffect(() => {
    bob.value = withRepeat(
      withTiming(active ? -9 : -5, {
        duration: active ? 850 : 1300,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [active, bob]);
  const bobStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }],
    opacity: active ? 1 : 0.82,
  }));

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      {/* speech bubble slot — tall enough to show the bubble fully */}
      <View style={{ height: 46, justifyContent: "flex-end", marginBottom: 2, zIndex: 5 }}>
        {says ? (
          <Bubble style={{ maxWidth: 158 }} background={bubbleStyle.bg} textColor={bubbleStyle.fg}>
            {says.text}
          </Bubble>
        ) : null}
      </View>

      {/* bare avatar — no tile; premium avatars get their themed aura */}
      <Animated.View style={bobStyle}>
        <View style={{ width: 54, height: 54, alignItems: "center", justifyContent: "center" }}>
          {badge ? (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: -4,
                right: -10,
                zIndex: 7,
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
                backgroundColor: colors.hues[badge.color][2],
                borderRadius: 999,
                paddingHorizontal: 6,
                paddingVertical: 2,
                boxShadow: `0 2px 0 ${colors.hues[badge.color][1]}55`,
              }}
            >
              <Text style={{ fontSize: 12 }}>{badge.icon}</Text>
              {badge.count != null && badge.count > 1 && (
                <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 10, color: colors.hues[badge.color][1] }}>
                  ×{badge.count}
                </Text>
              )}
            </View>
          ) : null}
          {auraEnt ? (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShapeAura entitlement={auraEnt} size={54} />
            </View>
          ) : null}
          <Text style={{ fontSize: 46, lineHeight: 50 }}>{avatar}</Text>
        </View>
      </Animated.View>

      <Text
        numberOfLines={1}
        style={{ fontFamily: "Fredoka_700Bold", fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 }}
      >
        {name}
      </Text>
      <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 24, color: c, lineHeight: 26 }}>
        {score}
      </Text>
      {active && (
        <View
          style={{
            marginTop: 2,
            backgroundColor: c,
            borderRadius: 8,
            paddingHorizontal: 9,
            paddingVertical: 2,
            boxShadow: `0 2px 0 ${cd}`,
          }}
        >
          <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 9, letterSpacing: 0.5, color: "#fff" }}>
            {t("game.turnBadge", "JOUE")}
          </Text>
        </View>
      )}

      {build && (
        <View
          style={{
            marginTop: 4,
            flexDirection: "row",
            alignItems: "center",
            gap: 3,
            maxWidth: 96,
            backgroundColor: colors.hues[color][2],
            borderRadius: 999,
            paddingHorizontal: 7,
            paddingVertical: 2,
          }}
        >
          <Text style={{ fontSize: 11 }}>{build.emoji}</Text>
          <Text
            numberOfLines={1}
            style={{ fontFamily: "Fredoka_700Bold", fontSize: 9.5, color: colors.hues[color][1] }}
          >
            {build.name}
          </Text>
        </View>
      )}
    </View>
  );
}
