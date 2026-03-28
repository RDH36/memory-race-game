import { useEffect, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";
import { Label } from "./Label";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const DURATION_IN = 320;
const DURATION_OUT = 250;
const OFFSET = 300;

/** Reusable bottom sheet modal — fade overlay + animated slide sheet */
export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);
  const translateY = useSharedValue(OFFSET);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      translateY.value = OFFSET;
      overlayOpacity.value = 0;
      // Small delay so Modal is mounted before animating
      requestAnimationFrame(() => {
        translateY.value = withTiming(0, { duration: DURATION_IN, easing: Easing.out(Easing.cubic) });
        overlayOpacity.value = withTiming(1, { duration: DURATION_IN });
      });
    } else if (modalVisible) {
      // Animate out, then hide Modal
      translateY.value = withTiming(OFFSET, { duration: DURATION_OUT, easing: Easing.in(Easing.cubic) });
      overlayOpacity.value = withTiming(0, { duration: DURATION_OUT }, () => {
        runOnJS(setModalVisible)(false);
      });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <Modal visible={modalVisible} transparent animationType="none">
      <View style={{ flex: 1 }}>
        {/* Animated overlay */}
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(26, 28, 23, 0.4)",
            },
            overlayStyle,
          ]}
        />

        {/* Tap-to-dismiss area */}
        <Pressable onPress={onClose} style={{ flex: 1, justifyContent: "flex-end" }}>
          <Pressable onPress={() => {}}>
            <Animated.View
              style={[
                {
                  backgroundColor: colors.surfaceContainer,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  paddingHorizontal: 20,
                  paddingTop: 20,
                  paddingBottom: Math.max(insets.bottom, 20) + 20,
                },
                sheetStyle,
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    paddingLeft: 28,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 4,
                      backgroundColor: isDark ? "#444" : "#E8E4E4",
                      borderRadius: 2,
                    }}
                  />
                </View>
                <Pressable
                  onPress={onClose}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: isDark ? "#444" : "#E8E4E4",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Label text="✕" style={{ marginBottom: 0, letterSpacing: 0, fontSize: 13, color: colors.onSurfaceVariant }} />
                </Pressable>
              </View>
              {title && <Label text={title} />}
              {children}
            </Animated.View>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
}
