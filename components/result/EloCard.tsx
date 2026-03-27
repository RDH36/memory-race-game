import { View, Text } from "react-native";
import { Card } from "../ui/Card";
import { IconBox } from "../ui/IconBox";
import { useTheme } from "../../lib/ThemeContext";

interface EloCardProps {
  eloChange: number;
  eloTotal: number;
}

export function EloCard({ eloChange, eloTotal }: EloCardProps) {
  const { colors } = useTheme();
  const isGain = eloChange >= 0;
  const changeColor = isGain ? colors.success : colors.error;
  const changeBg = isGain ? colors.successBg : colors.errorBg;
  const label = isGain ? "ELO GAGNÉ" : "ELO PERDU";
  const prefix = isGain ? "+" : "";

  return (
    <Card
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <IconBox emoji={isGain ? "📈" : "📉"} size={40} bg={changeBg} />
        <View>
          <Text
            style={{
              fontSize: 10,
              fontFamily: "Nunito_700Bold",
              color: colors.onSurfaceVariant,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            {label}
          </Text>
          <Text style={{ fontSize: 22, fontFamily: "Fredoka_700Bold", color: changeColor }}>
            {prefix}{eloChange}
          </Text>
        </View>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={{
            fontSize: 10,
            fontFamily: "Nunito_600SemiBold",
            color: colors.onSurfaceVariant,
            letterSpacing: 0.5,
          }}
        >
          Nouveau total
        </Text>
        <Text style={{ fontSize: 22, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
          {eloTotal.toLocaleString("fr-FR")}
        </Text>
      </View>
    </Card>
  );
}
