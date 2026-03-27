import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../lib/ThemeContext";
import { Label } from "./Label";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/** Reusable bottom sheet modal — fade overlay + rounded sheet from bottom */
export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(26, 28, 23, 0.4)",
          justifyContent: "flex-end",
        }}
      >
        <Pressable onPress={() => {}}>
          <View
            style={{
              backgroundColor: colors.surfaceContainer,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: Math.max(insets.bottom, 20) + 20,
            }}
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
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
