import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";
import { useTranslation } from "react-i18next";

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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      scale.value = 1.4;
      opacity.value = 0.6;
      scale.value = withSpring(1, { damping: 8, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
      {/* Players */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 24,
          marginBottom: 48,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 40 }}>{hostAvatar}</Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Fredoka_600SemiBold",
              color: colors.p1,
              marginTop: 6,
            }}
          >
            {hostNickname}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 20,
            fontFamily: "Fredoka_700Bold",
            color: colors.onSurfaceVariant,
          }}
        >
          VS
        </Text>

        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 40 }}>{guestAvatar}</Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Fredoka_600SemiBold",
              color: colors.p2,
              marginTop: 6,
            }}
          >
            {guestNickname}
          </Text>
        </View>
      </View>

      {/* Countdown label */}
      <Text
        style={{
          fontSize: 14,
          fontFamily: "Nunito_600SemiBold",
          color: colors.onSurfaceVariant,
          marginBottom: 12,
          letterSpacing: 1,
        }}
      >
        {t("room.startingIn")}
      </Text>

      {/* Number */}
      <Animated.Text
        style={[
          numberStyle,
          {
            fontSize: count === 0 ? 36 : 72,
            fontFamily: "Fredoka_700Bold",
            color: count <= 3 && count > 0 ? colors.error : colors.primaryContainer,
          },
        ]}
      >
        {count === 0 ? "GO!" : count}
      </Animated.Text>

      {/* Who starts first */}
      {firstPlayerName && (
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Nunito_700Bold",
            color: colors.onSurfaceVariant,
            marginTop: 24,
          }}
        >
          🎯 {firstPlayerName} {t("room.startsFirst")}
        </Text>
      )}
    </View>
  );
}
