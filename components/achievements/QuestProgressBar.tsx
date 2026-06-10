// Thin rounded progress bar for a quest card.
import { View } from "react-native";
import { useTheme } from "@/lib/ThemeContext";

export function QuestProgressBar({
  value,
  target,
  done,
}: {
  value: number;
  target: number;
  done: boolean;
}) {
  const { colors, isDark } = useTheme();
  const [base, lip] = colors.hues.green;
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  const w = done ? 100 : Math.max(pct === 0 ? 0 : 6, pct);

  return (
    <View
      style={{
        flex: 1,
        height: 11,
        backgroundColor: isDark ? "#2A2348" : "#E7DEF7",
        borderRadius: 999,
        overflow: "hidden",
      }}
    >
      {w > 0 && (
        <View
          style={{
            width: `${w}%`,
            height: "100%",
            borderRadius: 999,
            backgroundColor: base,
            boxShadow: `inset 0 2px 0 #FFFFFF66, 0 1px 0 ${lip}`,
          }}
        />
      )}
    </View>
  );
}
