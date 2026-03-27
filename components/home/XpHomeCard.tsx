import { Text, View } from "react-native";
import { Card } from "../ui/Card";
import { useTheme } from "../../lib/ThemeContext";

interface XpHomeCardProps {
  level: number;
  points: number;
  levelProgress: number;
  xpInLevel: number;
  xpForNextLevel: number;
}

export function XpHomeCard({ level, points, levelProgress, xpInLevel, xpForNextLevel }: XpHomeCardProps) {
  const { colors, isDark } = useTheme();
  return (
    <Card style={{ gap: 10, marginBottom: 28 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 11, fontFamily: "Nunito_700Bold", color: colors.onSurfaceVariant, letterSpacing: 0.5 }}>
          Nv. {level}
        </Text>
        <Text style={{ fontSize: 15, fontFamily: "Fredoka_700Bold", color: colors.primaryContainer }}>
          {points.toLocaleString("fr-FR")} XP
        </Text>
      </View>

      <View>
        <View style={{ height: 8, backgroundColor: isDark ? "#333" : "#E8E4E4", borderRadius: 4 }}>
          <View
            style={{
              width: `${Math.round(levelProgress * 100)}%`,
              height: 8,
              backgroundColor: colors.primaryContainer,
              borderRadius: 4,
            }}
          />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
          <Text style={{ fontSize: 11, fontFamily: "Nunito_700Bold", color: colors.onSurface }}>
            Nv. {level}
          </Text>
          <Text style={{ fontSize: 10, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant }}>
            {xpInLevel} / {xpForNextLevel} XP → Nv. {level + 1}
          </Text>
        </View>
      </View>
    </Card>
  );
}
