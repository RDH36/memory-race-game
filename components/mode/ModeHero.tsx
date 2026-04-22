import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Gradient } from "../ui/Gradient";

interface ModeHeroProps {
  gradientColors: [string, string];
  icon: string;
  title: string;
  subtitle: string;
}

export function ModeHero({ gradientColors, icon, title, subtitle }: ModeHeroProps) {
  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <Gradient
        colors={gradientColors}
        angle={135}
        borderRadius={22}
        style={{ padding: 20, marginBottom: 20 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              backgroundColor: "rgba(255,255,255,0.22)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 28 }}>{icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontFamily: "Fredoka_700Bold", color: "#FFF" }}>
              {title}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Nunito_400Regular",
                color: "rgba(255,255,255,0.8)",
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          </View>
        </View>
      </Gradient>
    </Animated.View>
  );
}
