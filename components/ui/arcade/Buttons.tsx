// Btn3D / IconBtn — chunky pressable buttons with a solid bottom
// "lip" (no gradients) that depresses on press, plus haptics.
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { useTheme } from "@/lib/ThemeContext";
import type { HueName } from "@/components/ui/theme";
import { haptics } from "@/lib/haptics";

const LIP = 6;

type Size = "lg" | "md" | "sm";
type HapticKind = "tap" | "press" | "select" | "none";

const SIZES: Record<Size, { padV: number; padH: number; font: number; radius: number }> = {
  lg: { padV: 15, padH: 24, font: 18, radius: 20 },
  md: { padV: 12, padH: 18, font: 15, radius: 16 },
  sm: { padV: 9, padH: 14, font: 13, radius: 13 },
};

export type Btn3DProps = {
  children?: React.ReactNode;
  label?: string;
  onPress?: () => void;
  color?: HueName;
  textColor?: string;
  size?: Size;
  full?: boolean;
  disabled?: boolean;
  loading?: boolean;
  haptic?: HapticKind;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Btn3D({
  children,
  label,
  onPress,
  color = "violet",
  textColor,
  size = "lg",
  full = false,
  disabled = false,
  loading = false,
  haptic = "tap",
  style,
  textStyle,
}: Btn3DProps) {
  const { colors } = useTheme();
  const [c, cd] = colors.hues[color];
  const sz = SIZES[size];
  const fg = textColor ?? (color === "white" || color === "gold" ? colors.onSurface : "#fff");
  const off = disabled || loading;

  const trigger = () => {
    if (off) return;
    if (haptic !== "none") haptics[haptic]();
    onPress?.();
  };

  return (
    <Pressable
      onPress={trigger}
      disabled={off}
      style={[{ alignSelf: full ? "stretch" : "flex-start", opacity: off ? 0.55 : 1 }, style]}
    >
      {({ pressed }) => (
        <View style={{ backgroundColor: cd, borderRadius: sz.radius, paddingBottom: LIP }}>
          <View
            style={{
              backgroundColor: c,
              borderRadius: sz.radius,
              paddingVertical: sz.padV,
              paddingHorizontal: sz.padH,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              transform: [{ translateY: pressed ? LIP : 0 }],
              overflow: "hidden",
            }}
          >
            {/* gloss highlight */}
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: "8%",
                right: "8%",
                top: 5,
                height: "34%",
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.32)",
              }}
            />
            {loading ? (
              <ActivityIndicator color={fg} />
            ) : (
              <>
                {children}
                {label != null && (
                  <Text
                    style={[
                      { fontFamily: "Fredoka_700Bold", fontSize: sz.font, color: fg },
                      textStyle,
                    ]}
                  >
                    {label}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}

export type IconBtnProps = {
  children?: React.ReactNode;
  onPress?: () => void;
  color?: HueName;
  size?: number;
  haptic?: HapticKind;
  style?: StyleProp<ViewStyle>;
};

export function IconBtn({
  children,
  onPress,
  color = "white",
  size = 44,
  haptic = "tap",
  style,
}: IconBtnProps) {
  const { colors } = useTheme();
  const [c, cd] = colors.hues[color];
  const fg = color === "white" || color === "gold" ? colors.onSurface : "#fff";

  const trigger = () => {
    if (haptic !== "none") haptics[haptic]();
    onPress?.();
  };

  return (
    <Pressable onPress={trigger} style={style}>
      {({ pressed }) => (
        <View style={{ width: size, backgroundColor: cd, borderRadius: 15, paddingBottom: LIP }}>
          <View
            style={{
              width: size,
              height: size,
              borderRadius: 15,
              backgroundColor: c,
              alignItems: "center",
              justifyContent: "center",
              transform: [{ translateY: pressed ? LIP : 0 }],
            }}
          >
            {typeof children === "string" ? (
              <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: size * 0.42, color: fg }}>
                {children}
              </Text>
            ) : (
              children
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}
