import { useEffect } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/ThemeContext";
import { Button } from "../ui/Button";
import { ConfettiParticles } from "../result/ConfettiParticles";

interface CelebrationModalProps {
  visible: boolean;
  type: "levelUp" | "achievement";
  level?: number;
  achievementId?: string;
  emoji?: string;
  onContinue: () => void;
}

export function CelebrationModal({
  visible,
  type,
  level,
  achievementId,
  emoji,
  onContinue,
}: CelebrationModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      overlayOpacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.85, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  const displayEmoji = type === "levelUp" ? "🎉" : emoji ?? "🏆";
  const title =
    type === "levelUp"
      ? t("celebration.levelUp.title", { level: level ?? 0 })
      : t("celebration.achievement.title");
  const subtitle =
    type === "levelUp"
      ? t("celebration.levelUp.subtitle")
      : achievementId
        ? t(`achievements.items.${achievementId}.title`)
        : "";

  const confettiKey = `${type}-${achievementId ?? level ?? "x"}`;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <Pressable
        onPress={onContinue}
        style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 }}
      >
        <Animated.View
          style={[
            overlayStyle,
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
            },
          ]}
        />
        <Animated.View
          style={[
            cardStyle,
            {
              backgroundColor: colors.surfaceContainer,
              borderRadius: 24,
              padding: 28,
              width: "100%",
              alignItems: "center",
              overflow: "hidden",
            },
          ]}
        >
          <View
            pointerEvents="none"
            style={{ position: "absolute", top: 90, left: 0, right: 0, alignItems: "center" }}
          >
            <ConfettiParticles key={confettiKey} />
          </View>
          <Text style={{ fontSize: 64, marginBottom: 12 }}>{displayEmoji}</Text>
          <Text
            style={{
              fontSize: 22,
              fontFamily: "Fredoka_700Bold",
              color: colors.onSurface,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Nunito_400Regular",
              color: colors.onSurfaceVariant,
              textAlign: "center",
              marginBottom: 24,
              lineHeight: 20,
            }}
          >
            {subtitle}
          </Text>
          <Button
            text={t("celebration.continue")}
            onPress={onContinue}
            style={{ alignSelf: "stretch" }}
          />
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
