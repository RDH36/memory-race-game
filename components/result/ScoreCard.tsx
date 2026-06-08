import { View, Text } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { Panel } from "@/components/ui/arcade";

interface ScoreCardProps {
  p1Avatar: string;
  p1Name: string;
  p1Score: number;
  p2Avatar: string;
  p2Name: string;
  p2Score: number;
  winner?: "p1" | "p2" | "draw";
}

function Side({
  avatar,
  name,
  score,
  hue,
  color,
  win,
}: {
  avatar: string;
  name: string;
  score: number;
  hue: readonly [string, string, string];
  color: string;
  win: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", position: "relative" }}>
      {win && (
        <Text style={{ position: "absolute", top: -20, fontSize: 24 }}>👑</Text>
      )}
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: hue[0],
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 0 ${hue[1]}`,
        }}
      >
        <Text style={{ fontSize: 34 }}>{avatar}</Text>
      </View>
      <Text
        style={{ fontSize: 12.5, fontFamily: "Fredoka_700Bold", color: colors.onSurfaceVariant, marginTop: 8 }}
        numberOfLines={1}
      >
        {name}
      </Text>
      <Text style={{ fontSize: 40, fontFamily: "Fredoka_700Bold", color, lineHeight: 44 }}>
        {score}
      </Text>
    </View>
  );
}

export function ScoreCard({
  p1Avatar,
  p1Name,
  p1Score,
  p2Avatar,
  p2Name,
  p2Score,
  winner,
}: ScoreCardProps) {
  const { colors } = useTheme();
  return (
    <Panel style={{ flexDirection: "row", alignItems: "center", paddingVertical: 24, paddingHorizontal: 16 }}>
      <Side
        avatar={p1Avatar}
        name={p1Name}
        score={p1Score}
        hue={colors.hues.blue}
        color={colors.p1}
        win={winner === "p1"}
      />
      <Text style={{ fontSize: 15, fontFamily: "Fredoka_700Bold", color: colors.onSurfaceMuted }}>VS</Text>
      <Side
        avatar={p2Avatar}
        name={p2Name}
        score={p2Score}
        hue={colors.hues.coral}
        color={colors.p2}
        win={winner === "p2"}
      />
    </Panel>
  );
}
