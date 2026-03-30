import { Modal, Pressable, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useTheme } from "../../lib/ThemeContext";
import { Button } from "./Button";

interface ConfirmModalProps {
  visible: boolean;
  icon?: string;
  title: string;
  message: string;
  cancelText: string;
  confirmText: string;
  confirmIcon?: string;
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
        style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 }}
      >
        <Animated.View
          style={[overlayStyle, { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)" }]}
        />
        <Animated.View
          style={[
            cardStyle,
            {
              backgroundColor: colors.surface,
              borderRadius: 24,
              padding: 28,
              width: "100%",
              alignItems: "center",
            },
          ]}
        >
          {icon && (
            <Text style={{ fontSize: 40, marginBottom: 12 }}>{icon}</Text>
          )}
          <Text
            style={{
              fontSize: 20,
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
              marginBottom: 28,
              lineHeight: 20,
            }}
          >
            {message}
          </Text>
          <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
            {cancelText ? (
              <Button
                text={cancelText}
                variant="secondary"
                onPress={onCancel}
                style={{ flex: 1 }}
              />
            ) : null}
            <Button
              text={confirmText}
              icon={confirmIcon}
              onPress={onConfirm}
              style={{ flex: 1 }}
            />
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
