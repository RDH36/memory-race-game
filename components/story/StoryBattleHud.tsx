// BattleHUD wrapper for story battles — wires the arcade chatter and the
// hero-vs-enemy header from the local game state.
import { useTranslation } from "react-i18next";
import { BattleHUD } from "@/components/game/arcade/BattleHUD";
import { useGameChatter } from "@/components/game/arcade/useGameChatter";
import { formatTime } from "@/components/game/PlayerHUD";
import type { LocalGameState } from "@/lib/gameLogic";
import type { MatchResult } from "@/hooks/useLocalGame";

export function StoryBattleHud({
  game,
  lastMatchResult,
  totalPairs,
  turnTimer,
  avatar,
  nickname,
  enemyAvatar,
  enemyName,
}: {
  game: LocalGameState;
  lastMatchResult: MatchResult;
  totalPairs: number;
  turnTimer: number;
  avatar: string;
  nickname: string;
  enemyAvatar: string;
  enemyName: string;
}) {
  const { t } = useTranslation();
  const chatter = useGameChatter({
    lastMatchResult,
    currentTurn: game.currentTurn as 1 | 2,
    status: game.status,
    playerAvatar: avatar,
    opponentAvatar: enemyAvatar,
    playerName: nickname || t("game.you"),
    opponentName: enemyName,
  });

  return (
    <BattleHUD
      player={{ avatar, name: t("game.you"), score: game.scores.p1, active: game.currentTurn === 1 }}
      opponent={{ avatar: enemyAvatar, name: enemyName, score: game.scores.p2, active: game.currentTurn === 2 }}
      matched={game.scores.p1 + game.scores.p2}
      totalPairs={totalPairs}
      chatter={chatter}
      timer={{ text: formatTime(turnTimer) }}
      playerBadge={game.shieldCharges.p1 > 0 ? { icon: "🛡️", count: game.shieldCharges.p1, color: "green" } : null}
      opponentBadge={game.freezeTurns.p2 > 0 ? { icon: "❄️", count: game.freezeTurns.p2, color: "blue" } : null}
      playerBuild={{ emoji: game.abilities.p1.emoji, name: t(`abilities.${game.abilities.p1.nameKey}.name`) }}
      opponentBuild={{ emoji: game.abilities.p2.emoji, name: t(`abilities.${game.abilities.p2.nameKey}.name`) }}
    />
  );
}
