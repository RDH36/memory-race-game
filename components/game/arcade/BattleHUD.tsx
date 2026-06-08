import { Text, View } from "react-native";
import { useTheme } from "@/lib/ThemeContext";
import { Panel } from "@/components/ui/arcade";
import { GameFighter } from "./GameFighter";

export type Chatter = { who: 1 | 2; text: string } | null;

type Fighter = { avatar: string; name: string; score: number; active: boolean };

/** Arcade top HUD: you vs opponent, big breathing avatars, score + bubbles. */
export function BattleHUD({
  player,
  opponent,
  matched,
  totalPairs,
  chatter,
  timer,
}: {
  player: Fighter;
  opponent: Fighter;
  matched: number;
  totalPairs: number;
  chatter: Chatter;
  /** Turn timer shown in the center (e.g. "45s" / "1:20"). */
  timer?: { text: string; low?: boolean };
}) {
  const { colors } = useTheme();
  const [coral, coralD] = colors.hues.coral;

  return (
    <Panel style={{ flexDirection: "row", alignItems: "flex-start", paddingVertical: 8, paddingHorizontal: 8 }}>
      <GameFighter
        avatar={player.avatar}
        name={player.name}
        score={player.score}
        color="blue"
        active={player.active}
        says={chatter?.who === 1 ? chatter.text : null}
      />

      {/* center VS + progress */}
      <View style={{ alignItems: "center", paddingTop: 52, paddingHorizontal: 2 }}>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 999,
            backgroundColor: coral,
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 0 ${coralD}`,
          }}
        >
          <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 13, color: "#fff" }}>VS</Text>
        </View>
        <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 11, color: colors.onSurfaceMuted, marginTop: 5 }}>
          {matched}/{totalPairs}
        </Text>
        {timer && (
          <View
            style={{
              marginTop: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
              backgroundColor: timer.low ? colors.errorBg : colors.surfaceContainerLow,
              borderRadius: 999,
              paddingHorizontal: 9,
              paddingVertical: 4,
              boxShadow: `0 2px 0 ${timer.low ? colors.hues.coral[1] : colors.panelLip}`,
            }}
          >
            <Text style={{ fontSize: 11 }}>⏱️</Text>
            <Text
              style={{
                fontFamily: "Fredoka_700Bold",
                fontSize: 14,
                color: timer.low ? colors.error : colors.onSurface,
              }}
            >
              {timer.text}
            </Text>
          </View>
        )}
      </View>

      <GameFighter
        avatar={opponent.avatar}
        name={opponent.name}
        score={opponent.score}
        color="coral"
        active={opponent.active}
        says={chatter?.who === 2 ? chatter.text : null}
      />
    </Panel>
  );
}
