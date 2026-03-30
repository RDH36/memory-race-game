import { Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Share } from "react-native";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useTheme } from "../../lib/ThemeContext";
import { Button } from "../ui/Button";
import { APP_VERSION } from "../../lib/constants";

interface RoomWaitingProps {
  code: string;
  onCancel: () => void;
}

export function RoomWaiting({ code, onCancel }: RoomWaitingProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withTiming(0.4, { duration: 1200 }),
      -1,
      true,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleShare = async () => {
    await Share.share({
      message: `${t("room.shareMessage")} ${code}`,
    });
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Animated.Text
        style={[
          pulseStyle,
          {
            fontSize: 16,
            fontFamily: "Nunito_600SemiBold",
            color: colors.onSurfaceVariant,
            marginBottom: 24,
          },
        ]}
      >
        {t("room.waiting")}
      </Animated.Text>

      <Text
        style={{
          fontSize: 12,
          fontFamily: "Nunito_600SemiBold",
          color: colors.onSurfaceVariant,
          letterSpacing: 2,
          marginBottom: 8,
        }}
      >
        {t("room.code")}
      </Text>

      <Text
        style={{
          fontSize: 42,
          fontFamily: "Fredoka_700Bold",
          color: colors.primaryContainer,
          letterSpacing: 8,
          marginBottom: 32,
        }}
      >
        {code}
      </Text>

      <Text
        style={{
          fontSize: 11,
          fontFamily: "Nunito_600SemiBold",
          color: colors.onSurfaceVariant,
          marginBottom: 24,
        }}
      >
        v{APP_VERSION}
      </Text>

      <View style={{ flexDirection: "row", gap: 12, marginBottom: 40 }}>
        <Button icon="📋" text={t("room.copy")} onPress={handleCopy} style={{ flex: 1 }} />
        <Button icon="🔗" text={t("room.share")} variant="secondary" onPress={handleShare} style={{ flex: 1 }} />
      </View>

      <Button icon="✕" text={t("room.cancel")} variant="ghost" onPress={onCancel} />
    </View>
  );
}
