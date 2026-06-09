import { useState, useEffect, useRef } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { usePlayerAbilities } from "../../lib/abilities";
import { haptics } from "@/lib/haptics";
import { createRoom, startRoom, deleteRoom, useRoom } from "../../lib/roomLogic";
import { ScreenHeader } from "@/components/ui/arcade";
import { ChoiceRow } from "@/components/mode/arcade/ChoiceRow";
import { RoomWaiting } from "../../components/room/RoomWaiting";
import { CountdownOverlay } from "../../components/room/CountdownOverlay";
import type { CpuDifficulty } from "../../lib/gameLogic";
import type { HueName } from "@/components/ui/theme";

const DIFFICULTY_DATA: {
  key: CpuDifficulty;
  icon: string;
  diff: string;
  pairs: number;
  color: HueName;
}[] = [
  { key: "easy", icon: "🐣", diff: "Facile", pairs: 6, color: "green" },
  { key: "medium", icon: "🦊", diff: "Moyen", pairs: 8, color: "violet" },
  { key: "hard", icon: "🤖", diff: "Difficile", pairs: 12, color: "coral" },
];

export default function CreateRoomScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { userId, nickname, avatar } = usePlayerStats();
  const { states, equipped } = usePlayerAbilities();
  const myAb = states.find((s) => s.id === equipped) ?? states[0];
  const hostAbility = { id: myAb.id, level: myAb.level, emoji: myAb.emoji, nameKey: myAb.nameKey };

  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<CpuDifficulty | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const startedRef = useRef(false);

  const { room } = useRoom(roomCode ?? undefined);

  const handleSelectDifficulty = async (diff: CpuDifficulty) => {
    if (loading || !userId) return;
    setLoading(diff);
    haptics.tap();

    const result = await createRoom(userId, nickname || "Host", avatar, diff);
    setRoomId(result.roomId);
    setRoomCode(result.code);
    setDifficulty(diff);
    setLoading(null);
  };

  // Watch for guest joining
  useEffect(() => {
    if (!room || !room.guestId || startedRef.current || !roomId || !difficulty)
      return;

    startedRef.current = true;
    startRoom(roomId, difficulty, room.hostId, room.guestId, hostAbility);
    setShowCountdown(true);
  }, [room?.guestId]);

  const handleCountdownComplete = () => {
    router.replace({
      pathname: "/game/online",
      params: { roomCode: roomCode!, difficulty: difficulty! },
    });
  };

  const handleCancel = () => {
    if (roomId) deleteRoom(roomId);
    router.back();
  };

  // Countdown overlay
  if (showCountdown && room) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
        <CountdownOverlay
          hostAvatar={room.hostAvatar}
          hostNickname={room.hostNickname}
          guestAvatar={room.guestAvatar ?? "🧠"}
          guestNickname={room.guestNickname ?? "Guest"}
          firstPlayerName={
            room.currentPlayerId === room.hostId
              ? room.hostNickname
              : room.guestNickname ?? "Guest"
          }
          onComplete={handleCountdownComplete}
        />
      </SafeAreaView>
    );
  }

  // Waiting for opponent
  if (roomCode) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader title={t("room.createRoom")} onBack={() => router.back()} />
        </View>
        <RoomWaiting code={roomCode} onCancel={handleCancel} />
      </SafeAreaView>
    );
  }

  // Difficulty selection
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
        <ScreenHeader title={t("room.chooseDifficulty")} onBack={() => router.back()} />

        <View style={{ gap: 13 }}>
          {DIFFICULTY_DATA.map((d, index) => (
            <ChoiceRow
              key={d.key}
              icon={d.icon}
              title={`${d.pairs} ${t("home.botModal.pairs", "paires")}`}
              desc={d.diff}
              color={d.color}
              delay={120 + index * 70}
              disabled={!!loading && loading !== d.key}
              onPress={() => handleSelectDifficulty(d.key)}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
