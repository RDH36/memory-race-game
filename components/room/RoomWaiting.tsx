import { Share, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useTranslation } from "react-i18next";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useTheme } from "../../lib/ThemeContext";
import { Btn3D } from "@/components/ui/arcade";
import { haptics } from "@/lib/haptics";
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
    pulseOpacity.value = withRepeat(withTiming(0.4, { duration: 1200 }), -1, true);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulseOpacity.value }));

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    haptics.coin();
  };

  const handleShare = async () => {
    await Share.share({ message: `${t("room.shareMessage")} ${code}` });
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text
        style={{
          fontSize: 13,
          fontFamily: "Fredoka_700Bold",
          color: colors.onSurfaceMuted,
          letterSpacing: 1,
          marginBottom: 14,
        }}
      >
        {t("room.code")}
      </Text>

      {/* code tiles */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
        {code.split("").map((ch, i) => (
          <View
            key={i}
            style={{
              width: 46,
              height: 58,
              borderRadius: 14,
              backgroundColor: colors.surfaceContainer,
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 3px 0 ${colors.panelLip}, 0 10px 20px -12px ${colors.panelShadow}`,
            }}
          >
            <Text style={{ fontSize: 26, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
              {ch}
            </Text>
          </View>
        ))}
      </View>

      <Animated.Text
        style={[
          pulseStyle,
          {
            fontSize: 15,
            fontFamily: "Fredoka_700Bold",
            color: colors.onSurfaceVariant,
            marginBottom: 4,
          },
        ]}
      >
        {t("room.waiting")}
      </Animated.Text>
      <Text
        style={{
          fontSize: 11,
          fontFamily: "Fredoka_700Bold",
          color: colors.onSurfaceMuted,
          marginBottom: 28,
        }}
      >
        v{APP_VERSION}
      </Text>

      <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
        <Btn3D color="violet" size="md" label={t("room.copy")} onPress={handleCopy}>
          <Text style={{ fontSize: 16 }}>📋</Text>
        </Btn3D>
        <Btn3D color="white" size="md" label={t("room.share")} onPress={handleShare}>
          <Text style={{ fontSize: 16 }}>🔗</Text>
        </Btn3D>
      </View>

      <Btn3D color="white" size="sm" label={t("room.cancel")} onPress={onCancel} haptic="tap" style={{ alignSelf: "center" }} />
    </View>
  );
}
