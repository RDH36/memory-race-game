import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  frame: string;
  back: string;
  face: string;
  locked?: boolean;
}

/**
 * Mini board preview — frame container with 3 small cards inside (back / face / back).
 * Per design: 22px wide cards, ratio 1.4, gap 6, inside table.frame colored frame.
 * If locked: dark overlay + golden lock on the middle (face) card only.
 */
export function TableMiniPreview({ frame, back, face, locked }: Props) {
  return (
    <View
      style={{
        backgroundColor: frame,
        borderRadius: 12,
        aspectRatio: 1.4,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
    >
      <MiniCard width={22} bg={back} face={false} />
      <MiniCard width={22} bg={face} face={true} locked={locked} />
      <MiniCard width={22} bg={back} face={false} />
    </View>
  );
}

interface CardProps {
  width: number;
  bg: string;
  face: boolean;
  locked?: boolean;
}

function MiniCard({ width, bg, face, locked }: CardProps) {
  const h = width * 1.4;
  return (
    <View
      style={{
        width,
        height: h,
        borderRadius: 5,
        backgroundColor: bg,
        overflow: "hidden",
      }}
    >
      {!face && (
        <View
          style={{
            position: "absolute",
            top: 2.5, left: 2.5, right: 2.5, bottom: 2.5,
            borderRadius: 3,
            borderWidth: 1.2,
            borderColor: "rgba(255,255,255,0.25)",
          }}
        />
      )}
      {locked && face && (
        <View
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="lock-closed" size={width * 0.42} color="#FFD366" />
        </View>
      )}
    </View>
  );
}
