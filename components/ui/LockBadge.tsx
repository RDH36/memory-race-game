import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  size?: number;
  position?: "top-right" | "center";
  label?: string;
}

/** Small lock indicator overlay for premium-locked items. */
export function LockBadge({ size = 18, position = "top-right", label }: Props) {
  if (position === "center") {
    return (
      <View
        style={{
          position: "absolute",
          inset: 0,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.45)",
          borderRadius: 999,
        }}
      >
        <Ionicons name="lock-closed" size={size} color="#FFF" />
        {label && (
          <Text style={{ color: "#FFF", fontSize: 9, fontFamily: "Nunito_700Bold", marginTop: 2 }}>
            {label}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View
      style={{
        position: "absolute",
        top: -4,
        right: -4,
        width: size + 6,
        height: size + 6,
        borderRadius: (size + 6) / 2,
        backgroundColor: "#FFD700",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name="lock-closed" size={size - 4} color="#1A1C17" />
    </View>
  );
}
