import { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from "react-native-reanimated";

export default function ResultScreen() {
  const { p1Score = "0", p2Score = "0", difficulty = "medium" } =
    useLocalSearchParams<{
      p1Score?: string;
      p2Score?: string;
      difficulty?: string;
    }>();
  const router = useRouter();

  const s1 = parseInt(p1Score, 10);
  const s2 = parseInt(p2Score, 10);
  const winner = s1 > s2 ? "p1" : s2 > s1 ? "p2" : "draw";

  const scaleEmoji = useSharedValue(0);
  const opacityContent = useSharedValue(0);

  useEffect(() => {
    if (winner === "p1") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (winner === "p2") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    scaleEmoji.value = withSpring(1, { damping: 8, stiffness: 120 });
    opacityContent.value = withDelay(400, withTiming(1, { duration: 500 }));
  }, []);

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleEmoji.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacityContent.value,
  }));

  const resultEmoji = winner === "p1" ? "🎉" : winner === "p2" ? "😤" : "🤝";
  const resultText =
    winner === "p1"
      ? "Victoire !"
      : winner === "p2"
        ? "Défaite..."
        : "Égalité !";
  const resultColor =
    winner === "p1" ? "#1D9E75" : winner === "p2" ? "#D85A30" : "#534AB7";

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: "#F5F5F0" }}
    >
      {/* Result emoji */}
      <Animated.View style={emojiStyle}>
        <Text style={{ fontSize: 80 }}>{resultEmoji}</Text>
      </Animated.View>

      <Animated.View style={contentStyle} className="items-center w-full">
        {/* Result text */}
        <Text
          style={{
            fontSize: 32,
            fontWeight: "800",
            color: resultColor,
            marginTop: 16,
            marginBottom: 32,
          }}
        >
          {resultText}
        </Text>

        {/* Scores */}
        <View
          style={{
            flexDirection: "row",
            gap: 32,
            marginBottom: 48,
            alignItems: "center",
          }}
        >
          <View className="items-center">
            <Text
              style={{ fontSize: 14, fontWeight: "500", color: "#6B6B6B" }}
            >
              Joueur
            </Text>
            <Text
              style={{ fontSize: 48, fontWeight: "700", color: "#378ADD" }}
            >
              {s1}
            </Text>
          </View>

          <Text
            style={{ fontSize: 20, fontWeight: "600", color: "#D0D0C8" }}
          >
            —
          </Text>

          <View className="items-center">
            <Text
              style={{ fontSize: 14, fontWeight: "500", color: "#6B6B6B" }}
            >
              CPU
            </Text>
            <Text
              style={{ fontSize: 48, fontWeight: "700", color: "#D85A30" }}
            >
              {s2}
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.replace({
              pathname: "/game",
              params: { difficulty },
            });
          }}
          style={({ pressed }) => ({
            backgroundColor: "#534AB7",
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 16,
            width: "100%",
            alignItems: "center",
            transform: [{ scale: pressed ? 0.96 : 1 }],
            marginBottom: 12,
          })}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
            Rejouer
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.replace("/");
          }}
          style={({ pressed }) => ({
            backgroundColor: "#FFFFFF",
            borderWidth: 2,
            borderColor: "#D0D0C8",
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 16,
            width: "100%",
            alignItems: "center",
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
        >
          <Text style={{ color: "#1A1A1A", fontSize: 16, fontWeight: "600" }}>
            Menu principal
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
