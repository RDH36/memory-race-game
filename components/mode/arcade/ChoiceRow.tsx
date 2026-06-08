import { Text, View } from "react-native";
import { useTheme } from "@/lib/ThemeContext";
import type { HueName } from "@/components/ui/theme";
import { Panel, Ribbon, Rise } from "@/components/ui/arcade";

export type ChoiceRowProps = {
  icon: string;
  title: string;
  desc: string;
  color: HueName;
  badge?: string;
  badgeColor?: HueName;
  locked?: boolean;
  disabled?: boolean;
  delay?: number;
  onPress?: () => void;
  /** Optional element rendered on the right instead of the chevron. */
  right?: React.ReactNode;
};

/** Big rich choice row — mode select, online menu, difficulty, etc. */
export function ChoiceRow({
  icon,
  title,
  desc,
  color,
  badge,
  badgeColor = "gold",
  locked,
  disabled,
  delay = 0,
  onPress,
  right,
}: ChoiceRowProps) {
  const { colors } = useTheme();
  const [c, cd] = colors.hues[color];
  const off = locked || disabled;

  return (
    <Rise delay={delay}>
      <View style={{ opacity: off ? 0.6 : 1 }}>
        <Panel
          onPress={off ? undefined : onPress}
          style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 15 }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              backgroundColor: c,
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 0 ${cd}`,
            }}
          >
            <Text style={{ fontSize: 30 }}>{icon}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 18, color: colors.onSurface }}>
                {title}
              </Text>
              {badge && <Ribbon color={locked ? "violet" : badgeColor}>{badge}</Ribbon>}
            </View>
            <Text
              style={{
                fontFamily: "Fredoka_700Bold",
                fontSize: 12,
                color: colors.onSurfaceMuted,
                marginTop: 3,
                lineHeight: 16,
              }}
            >
              {desc}
            </Text>
          </View>
          {right ?? (
            !locked && (
              <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 26, color: c }}>›</Text>
            )
          )}
        </Panel>
      </View>
    </Rise>
  );
}
