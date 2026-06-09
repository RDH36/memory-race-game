import { Text, View } from "react-native";
import { useTheme } from "@/lib/ThemeContext";
import type { HueName } from "@/components/ui/theme";
import { Panel } from "@/components/ui/arcade";
import { GameFighter } from "./GameFighter";

export type { Chatter } from "./useGameChatter";
import type { Chatter } from "./useGameChatter";

type Fighter = { avatar: string; name: string; score: number; active: boolean };
type Badge = { icon: string; count?: number; color: HueName } | null;
type Build = { emoji: string; name: string } | null;

/** Arcade top HUD: you vs opponent, big breathing avatars, score + bubbles. */
export function BattleHUD({
  player,
  opponent,
  matched,
  totalPairs,
  chatter,
  timer,
  playerBadge,
  opponentBadge,
  playerBuild,
  opponentBuild,
}: {
  player: Fighter;
  opponent: Fighter;
  matched: number;
  totalPairs: number;
  chatter: Chatter;
  /** Turn timer shown in the center (e.g. "45s" / "1:20"). */
  timer?: { text: string; low?: boolean };
  playerBadge?: Badge;
  opponentBadge?: Badge;
  playerBuild?: Build;
  opponentBuild?: Build;
}) {
  const { colors } = useTheme();
  const [coral, coralD] = colors.hues.coral;

  return (
    <Panel
      background={colors.primaryContainerBg}
      style={{ overflow: "hidden", paddingVertical: 8, paddingHorizontal: 8 }}
    >
      {/* arcade gloss highlight */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: "5%",
          right: "5%",
          top: 5,
          height: "32%",
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.22)",
        }}
      />

      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <GameFighter
          avatar={player.avatar}
          name={player.name}
          score={player.score}
          color="blue"
          active={player.active}
          says={chatter?.who === 1 ? { text: chatter.text, kind: chatter.kind } : null}
          badge={playerBadge}
          build={playerBuild}
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
          <View
            style={{
              marginTop: 6,
              backgroundColor: colors.surfaceContainer,
              borderRadius: 999,
              paddingHorizontal: 9,
              paddingVertical: 2,
              boxShadow: `0 2px 0 ${colors.panelLip}`,
            }}
          >
            <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 11, color: colors.onSurface }}>
              {matched}/{totalPairs}
            </Text>
          </View>
          {timer && (
            <View
              style={{
                marginTop: 7,
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
                backgroundColor: timer.low ? colors.errorBg : colors.surfaceContainer,
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
          says={chatter?.who === 2 ? { text: chatter.text, kind: chatter.kind } : null}
          badge={opponentBadge}
          build={opponentBuild}
        />
      </View>
    </Panel>
  );
}
