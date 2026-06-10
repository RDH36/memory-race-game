// Small pill badge anchored to a tab icon (e.g. "NEW", or a claimable count).
import { Text, View } from "react-native";

export function TabBadge({
  label,
  color,
  lip,
}: {
  label: string;
  color: string;
  lip: string;
}) {
  return (
    <View
      style={{
        position: "absolute",
        top: -5,
        right: -9,
        minWidth: 16,
        height: 16,
        paddingHorizontal: 3,
        borderRadius: 8,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 1px 0 ${lip}`,
      }}
    >
      <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: label.length > 2 ? 8 : 9, color: "#fff" }}>
        {label}
      </Text>
    </View>
  );
}
