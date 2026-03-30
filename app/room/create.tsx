import { useState, useEffect, useRef } from "react";
import { Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { createRoom, startRoom, deleteRoom, useRoom } from "../../lib/roomLogic";
import { BotSelectCard } from "../../components/home/BotSelectCard";
import { Label } from "../../components/ui/Label";
import { RoomWaiting } from "../../components/room/RoomWaiting";
import { CountdownOverlay } from "../../components/room/CountdownOverlay";
import type { CpuDifficulty } from "../../lib/gameLogic";

const DIFFICULTY_DATA = [
  { key: "easy", name: "6 paires", avatar: "🃏", color: "#1D9E75", pairs: 6, power: 1 },
  { key: "medium", name: "8 paires", avatar: "🃏", color: "#A2340A", pairs: 8, power: 2 },
  { key: "hard", name: "12 paires", avatar: "🃏", color: "#534AB7", pairs: 12, power: 3 },
] as const;

export default function CreateRoomScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { userId, nickname, avatar } = usePlayerStats();

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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
    startRoom(roomId, difficulty, room.hostId, room.guestId);
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
        <View style={{ padding: 16 }}>
          <Pressable onPress={() => router.back()} hitSlop={16}
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: colors.surfaceContainer, alignSelf: "flex-start" }}
          >
            <Text style={{ fontSize: 18, color: colors.onSurfaceVariant, marginRight: 4 }}>←</Text>
            <Text style={{ fontSize: 14, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant }}>{t("game.menu")}</Text>
          </Pressable>
        </View>
        <RoomWaiting code={roomCode} onCancel={handleCancel} />
      </SafeAreaView>
    );
  }

  // Difficulty selection
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        <Pressable onPress={() => router.back()} hitSlop={16}
          style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: colors.surfaceContainer, alignSelf: "flex-start", marginBottom: 24 }}
        >
          <Text style={{ fontSize: 18, color: colors.onSurfaceVariant, marginRight: 4 }}>←</Text>
          <Text style={{ fontSize: 14, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant }}>{t("game.menu")}</Text>
        </Pressable>

        <Label text={t("room.chooseDifficulty")} style={{ marginBottom: 16 }} />

        <View style={{ gap: 12 }}>
          {DIFFICULTY_DATA.map((d, index) => (
            <BotSelectCard
              key={d.key}
              botKey={d.key}
              name={d.name}
              avatar={d.avatar}
              color={d.color}
              pairs={d.pairs}
              power={d.power}
              index={index}
              loading={loading}
              onPress={() => handleSelectDifficulty(d.key as CpuDifficulty)}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
