import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";
import { haptics } from "@/lib/haptics";
import { useTranslation } from "react-i18next";

function Fighter({
  avatar,
  name,
  hue,
}: {
  avatar: string;
  name: string;
  hue: readonly [string, string, string];
}) {
  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 28,
          backgroundColor: hue[0],
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 6px 0 ${hue[1]}`,
        }}
      >
        <Text style={{ fontSize: 50 }}>{avatar}</Text>
      </View>
      <Text style={{ fontSize: 16, fontFamily: "Fredoka_700Bold", color: hue[1], marginTop: 12 }} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

interface CountdownOverlayProps {
  hostAvatar: string;
  hostNickname: string;
  guestAvatar: string;
  guestNickname: string;
  firstPlayerName?: string;
  onComplete: () => void;
}

export function CountdownOverlay({
  hostAvatar,
  hostNickname,
  guestAvatar,
  guestNickname,
  firstPlayerName,
  onComplete,
}: CountdownOverlayProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [count, setCount] = useState(10);
  const scale = useSharedValue(1.4);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (count > 0) {
      haptics.countdown();
      scale.value = 1.4;
      opacity.value = 0.6;
      scale.value = withSpring(1, { damping: 8, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      haptics.go();
      scale.value = withSpring(1.6, { damping: 6, stiffness: 150 });
    }
  }, [count]);

  const numberStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.surface,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontFamily: "Fredoka_700Bold",
          letterSpacing: 2,
          color: colors.primary,
          marginBottom: 26,
        }}
      >
        ★ {t("room.startingIn").toUpperCase()} ★
      </Text>

      {/* Fighters */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 44 }}>
        <Fighter avatar={hostAvatar} name={hostNickname} hue={colors.hues.blue} />
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            backgroundColor: colors.hues.coral[0],
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 5px 0 ${colors.hues.coral[1]}`,
          }}
        >
          <Text style={{ fontSize: 20, fontFamily: "Fredoka_700Bold", color: "#fff" }}>VS</Text>
        </View>
        <Fighter avatar={guestAvatar} name={guestNickname} hue={colors.hues.coral} />
      </View>

      {/* Number */}
      <Animated.Text
        style={[
          numberStyle,
          {
            fontSize: count === 0 ? 54 : 72,
            fontFamily: "Fredoka_700Bold",
            color: count === 0 ? colors.success : count <= 3 ? colors.error : colors.primary,
          },
        ]}
      >
        {count === 0 ? "GO !" : count}
      </Animated.Text>

      {/* Who starts first */}
      {firstPlayerName && (
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Fredoka_700Bold",
            color: colors.onSurfaceMuted,
            marginTop: 24,
          }}
        >
          🎯 {firstPlayerName} {t("room.startsFirst")}
        </Text>
      )}
    </View>
  );
}
