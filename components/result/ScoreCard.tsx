import { View, Text } from "react-native";
import { Card } from "../ui/Card";
import { IconBox } from "../ui/IconBox";
import { useTheme } from "../../lib/ThemeContext";

interface ScoreCardProps {
  p1Avatar: string;
  p1Name: string;
  p1Score: number;
  p2Avatar: string;
  p2Name: string;
  p2Score: number;
}

export function ScoreCard({
  p1Avatar,
  p1Name,
  p1Score,
  p2Avatar,
  p2Name,
  p2Score,
}: ScoreCardProps) {
  const { colors } = useTheme();
  return (
    <Card style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 24 }}>
      {/* Player 1 */}
      <View style={{ alignItems: "center", flex: 1 }}>
        <IconBox emoji={p1Avatar} size={44} bg={colors.p1Bg} />
        <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginTop: 6 }}>
          {p1Name}
        </Text>
        <Text style={{ fontSize: 40, fontFamily: "Fredoka_700Bold", color: colors.p1 }}>
          {p1Score}
        </Text>
      </View>

      {/* Separator */}
      <Text style={{ fontSize: 18, fontFamily: "Nunito_600SemiBold", color: "#D0D0C8" }}>—</Text>

      {/* Player 2 */}
      <View style={{ alignItems: "center", flex: 1 }}>
        <IconBox emoji={p2Avatar} size={44} bg={colors.p2Bg} />
        <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginTop: 6 }}>
          {p2Name}
        </Text>
        <Text style={{ fontSize: 40, fontFamily: "Fredoka_700Bold", color: colors.p2 }}>
          {p2Score}
        </Text>
      </View>
    </Card>
  );
}
