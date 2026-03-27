import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { useLocalGame } from "../../hooks/useLocalGame";
import { GameGrid } from "../../components/game/GameGrid";
import { PlayerHUD } from "../../components/game/PlayerHUD";
import { ActionBar } from "../../components/game/ActionBar";
import { TornadoOverlay } from "../../components/game/TornadoOverlay";
import type { CpuDifficulty } from "../../lib/gameLogic";

export default function GameScreen() {
  const { difficulty = "medium" } = useLocalSearchParams<{
    difficulty?: string;
  }>();
  const router = useRouter();
  const { game, handleCardPress, handleTornado, handleTornadoComplete } =
    useLocalGame(difficulty as CpuDifficulty);

  useEffect(() => {
    if (game.status === "finished") {
      router.replace({
        pathname: "/result",
        params: {
          p1Score: game.scores.p1.toString(),
          p2Score: game.scores.p2.toString(),
          difficulty,
        },
      });
    }
  }, [game.status]);

  const canUseTornado =
    game.currentTurn === 1 &&
    !game.tornadoUsed.p1 &&
    !game.locked &&
    !game.tornadoActive &&
    game.status === "playing";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F0" }}>
      <View className="flex-1 px-4 pt-2 pb-4 justify-between">
        <PlayerHUD
          scores={game.scores}
          tornadoUsed={game.tornadoUsed}
          currentTurn={game.currentTurn}
        />

        <View className="flex-1 justify-center">
          <GameGrid
            positions={game.positions}
            cardEmojis={game.cardEmojis}
            selected={game.selected}
            matchedBy={game.matchedBy}
            locked={game.locked}
            currentTurn={game.currentTurn}
            onCardPress={handleCardPress}
          />
        </View>

        <ActionBar canUseTornado={canUseTornado} onTornado={handleTornado} />
      </View>

      {game.tornadoActive && (
        <TornadoOverlay onComplete={handleTornadoComplete} />
      )}
    </SafeAreaView>
  );
}
