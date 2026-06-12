// Arcade-styled confirmation modal — chunky panel with a 3D lip, Btn3D
// actions and an optional gold link chip under the buttons.
import { Modal, Pressable, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useTheme } from "../../lib/ThemeContext";
import { Btn3D } from "../ui/arcade";
import type { HueName } from "../ui/theme";

interface ConfirmModalProps {
  visible: boolean;
  icon?: string;
  title: string;
  message: string;
  cancelText: string;
  confirmText: string;
  confirmIcon?: string;
  /** Arcade hue of the confirm button (default violet). */
  confirmColor?: HueName;
  /** Optional gold link chip shown under the buttons. */
  linkText?: string;
  onLink?: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  visible,
  icon,
  title,
  message,
  cancelText,
  confirmText,
  confirmIcon,
  confirmColor = "violet",
  linkText,
  onLink,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.85, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none">
      <Pressable
        onPress={onCancel}
        style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 28 }}
      >
        <Animated.View
          style={[overlayStyle, { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(10,6,30,0.62)" }]}
        />
        <Animated.View
          style={[
            cardStyle,
            {
              backgroundColor: colors.surfaceContainer,
              borderRadius: 26,
              padding: 24,
              width: "100%",
              alignItems: "center",
              boxShadow: `0 6px 0 ${colors.panelLip}, 0 24px 48px -16px rgba(0,0,0,0.45)`,
            },
          ]}
        >
          {/* Badged emoji — same recipe as the arcade feature cards */}
          {icon && (
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 22,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.hues.violet[2],
                boxShadow: `0 4px 0 ${colors.hues.violet[1]}33`,
                marginTop: -52,
                marginBottom: 14,
              }}
            >
              <Text style={{ fontSize: 38 }}>{icon}</Text>
            </View>
          )}
          <Text
            style={{
              fontSize: 21,
              fontFamily: "Fredoka_700Bold",
              color: colors.onSurface,
              marginBottom: 8,
              textAlign: "center",
              letterSpacing: -0.3,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Nunito_600SemiBold",
              color: colors.onSurfaceVariant,
              textAlign: "center",
              marginBottom: 24,
              lineHeight: 20.5,
            }}
          >
            {message}
          </Text>
          <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
            {cancelText ? (
              <Btn3D
                color="white"
                size="md"
                label={cancelText}
                onPress={onCancel}
                style={{ flex: 1 }}
              />
            ) : null}
            <Btn3D
              color={confirmColor}
              size="md"
              haptic="press"
              label={confirmText}
              onPress={onConfirm}
              style={{ flex: 1 }}
            >
              {confirmIcon ? <Text style={{ fontSize: 15 }}>{confirmIcon}</Text> : null}
            </Btn3D>
          </View>
          {linkText && onLink ? (
            <Pressable onPress={onLink} hitSlop={8} style={{ marginTop: 14, width: "100%" }}>
              {({ pressed }) => (
                <View
                  style={{
                    backgroundColor: colors.hues.gold[2],
                    borderRadius: 14,
                    paddingVertical: 11,
                    paddingHorizontal: 14,
                    alignItems: "center",
                    boxShadow: `0 3px 0 ${colors.hues.gold[1]}`,
                    transform: [{ translateY: pressed ? 3 : 0 }],
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13.5,
                      fontFamily: "Fredoka_700Bold",
                      color: colors.hues.gold[1],
                      textAlign: "center",
                    }}
                  >
                    {linkText}
                  </Text>
                </View>
              )}
            </Pressable>
          ) : null}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
