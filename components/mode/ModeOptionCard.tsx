import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";

interface ModeOptionCardProps {
  icon: string;
  title: string;
  desc: string;
  color: string;
  index: number;
  disabled?: boolean;
  onPress: () => void;
}

export function ModeOptionCard({
  icon,
  title,
  desc,
  color,
  index,
  disabled,
  onPress,
}: ModeOptionCardProps) {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(160 + index * 80).duration(350)}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.97 : 1 }],
          opacity: disabled ? 0.5 : 1,
        })}
      >
        <View
          style={{
            position: "relative",
            backgroundColor: colors.surfaceContainer,
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 4,
              backgroundColor: color,
            }}
          />
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: color + "18",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 4,
            }}
          >
            <Text style={{ fontSize: 24 }}>{icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontFamily: "Fredoka_700Bold", color }}>{title}</Text>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Nunito_600SemiBold",
                color: colors.onSurfaceMuted,
                marginTop: 2,
              }}
            >
              {desc}
            </Text>
          </View>
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: color + "14",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 14, color, fontFamily: "Fredoka_700Bold" }}>›</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
