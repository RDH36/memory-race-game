// Headers — SectionTitle, ScreenHeader and the chunky XPBar.
import React from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@/lib/ThemeContext";
import type { HueName } from "@/components/ui/theme";
import { IconBtn } from "./Buttons";

export function SectionTitle({
  children,
  action,
  style,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
        style,
      ]}
    >
      <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 17, color: colors.onSurface }}>
        {children}
      </Text>
      {action}
    </View>
  );
}

export function ScreenHeader({
  title,
  onBack,
  right,
  style,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 }, style]}
    >
      {onBack && (
        <IconBtn color="white" onPress={onBack}>
          ‹
        </IconBtn>
      )}
      <Text
        style={{ flex: 1, fontFamily: "Fredoka_700Bold", fontSize: 24, color: colors.onSurface }}
      >
        {title}
      </Text>
      {right}
    </View>
  );
}

export function XPBar({
  level,
  pct,
  xpIn,
  xpFor,
  compact = false,
  color = "violet",
}: {
  level: number;
  pct: number;
  xpIn?: number;
  xpFor?: number;
  compact?: boolean;
  color?: HueName;
}) {
  const { colors, isDark } = useTheme();
  const [c, cd] = colors.hues[color];
  const w = Math.max(5, Math.min(100, pct));
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
        <View
          style={{
            backgroundColor: c,
            borderRadius: 999,
            paddingVertical: 3,
            paddingHorizontal: 10,
            boxShadow: `0 2px 0 ${cd}`,
          }}
        >
          <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 12, color: "#fff" }}>
            Nv {level}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            height: 13,
            backgroundColor: isDark ? "#2A2348" : "#E7DEF7",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${w}%`,
              height: "100%",
              borderRadius: 999,
              backgroundColor: c,
              boxShadow: "inset 0 2px 0 #FFFFFF66",
            }}
          />
        </View>
      </View>
      {!compact && xpIn != null && xpFor != null && (
        <Text
          style={{
            fontFamily: "Fredoka_700Bold",
            fontSize: 11,
            color: colors.onSurfaceMuted,
            textAlign: "right",
            marginTop: 4,
          }}
        >
          {xpIn} / {xpFor} XP
        </Text>
      )}
    </View>
  );
}
