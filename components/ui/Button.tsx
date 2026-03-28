import { ActivityIndicator, Pressable, View, Text, ViewStyle } from "react-native";
import { ReactNode } from "react";
import { radii } from "./theme";
import { useTheme } from "../../lib/ThemeContext";

interface ButtonProps {
  text: string;
  icon?: string;
  iconNode?: ReactNode;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

/** Rounded-full button — primary (purple), secondary (tinted bg), ghost (text only) */
export function Button({
  text,
  icon,
  iconNode,
  onPress,
  variant = "primary",
  loading,
  disabled,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const bg =
    variant === "primary"
      ? colors.primaryContainer
      : variant === "secondary"
        ? colors.surfaceContainer
        : "transparent";
  const textColor =
    variant === "primary"
      ? "#FFFFFF"
      : variant === "ghost"
        ? colors.onSurfaceVariant
        : colors.onSurface;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}
    >
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: bg,
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderRadius: radii.lg,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color={textColor} />
          ) : (
            <>
              {iconNode ?? (icon && <Text style={{ fontSize: 16 }}>{icon}</Text>)}
              <Text style={{ color: textColor, fontSize: 14, fontFamily: "Nunito_700Bold" }}>
                {text}
              </Text>
            </>
          )}
        </View>
      )}
    </Pressable>
  );
}
