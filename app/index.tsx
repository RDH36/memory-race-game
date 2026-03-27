import { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";

const DIFFICULTIES = [
  {
    key: "easy" as const,
    icon: "🐣",
    label: "Facile",
    desc: "CPU distrait",
    color: "#1D9E75",
    bg: "#ECFDF5",
  },
  {
    key: "medium" as const,
    icon: "🦊",
    label: "Normal",
    desc: "CPU malin",
    color: "#D85A30",
    bg: "#FAECE7",
  },
  {
    key: "hard" as const,
    icon: "🔥",
    label: "Difficile",
    desc: "CPU imbattable",
    color: "#534AB7",
    bg: "#F0EDFB",
  },
];

const DECO_EMOJIS = ["🐶", "🐱", "🦊", "🦋"];

function DecoCard({ emoji, delay }: { emoji: string; delay: number }) {
  const flip = useSharedValue(0);

  useEffect(() => {
    flip.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const frontStyle = useAnimatedStyle(() => ({
    opacity: flip.value > 0.5 ? 1 : 0,
    transform: [{ rotateY: `${flip.value * 180}deg` }],
    backfaceVisibility: "hidden" as const,
  }));

  const backStyle = useAnimatedStyle(() => ({
    opacity: flip.value > 0.5 ? 0 : 1,
    transform: [{ rotateY: `${flip.value * 180 - 180}deg` }],
    backfaceVisibility: "hidden" as const,
  }));

  return (
    <View
      style={{
        width: 48,
        height: 48,
        margin: 4,
      }}
    >
      <Animated.View
        style={[
          backStyle,
          {
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "#E6F1FB",
            borderWidth: 2,
            borderColor: "#378ADD",
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Text style={{ color: "#378ADD", fontWeight: "700", fontSize: 16 }}>
          ?
        </Text>
      </Animated.View>
      <Animated.View
        style={[
          frontStyle,
          {
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "#FFFFFF",
            borderWidth: 2,
            borderColor: "#D0D0C8",
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </Animated.View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 600 });
    subtitleOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: (1 - titleOpacity.value) * 20 }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const handleSelect = (difficulty: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/game", params: { difficulty } });
  };

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: "#F5F5F0" }}
    >
      {/* Title */}
      <Animated.View style={titleStyle} className="items-center mb-2">
        <Text
          style={{
            fontSize: 42,
            fontWeight: "800",
            color: "#1A1A1A",
            textAlign: "center",
          }}
        >
          🧠 Memory Race
        </Text>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View style={subtitleStyle} className="mb-10">
        <Text
          style={{
            fontSize: 16,
            color: "#6B6B6B",
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          Défie ta mémoire !
        </Text>
      </Animated.View>

      {/* Difficulty cards */}
      <View className="w-full gap-3 mb-10">
        {DIFFICULTIES.map((d) => (
          <Pressable
            key={d.key}
            onPress={() => handleSelect(d.key)}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <View
              style={{
                backgroundColor: d.bg,
                borderWidth: 2,
                borderColor: d.color,
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 20,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 36 }}>{d.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: d.color,
                  }}
                >
                  {d.label}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#6B6B6B",
                    marginTop: 2,
                  }}
                >
                  {d.desc}
                </Text>
              </View>
              <Text style={{ fontSize: 20, color: d.color }}>→</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Decorative mini grid */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          width: 112,
          justifyContent: "center",
        }}
      >
        {DECO_EMOJIS.map((emoji, i) => (
          <DecoCard key={i} emoji={emoji} delay={i * 400} />
        ))}
      </View>
    </View>
  );
}
