import { useState, useEffect, useRef, useCallback } from "react";
import { Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  FadeIn,
} from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import {
  findMatchmakingRoom,
  createMatchmakingRoom,
  joinMatchmakingRoom,
  startRoom,
  deleteRoom,
  useRoomById,
} from "../../lib/roomLogic";
import { CountdownOverlay } from "../../components/room/CountdownOverlay";
import { Button } from "../../components/ui/Button";
import { id, tx } from "@instantdb/react-native";
import { db } from "../../lib/instant";
import type { CpuDifficulty } from "../../lib/gameLogic";
import { randomFakeName, randomFakeAvatar } from "../../lib/fakeNames";

// Random timeout between 30s and 60s so players don't notice the pattern
const BOT_TIMEOUT_MIN = 30;
const BOT_TIMEOUT_MAX = 60;

type MatchState = "searching" | "found" | "countdown";

export default function MatchmakingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { userId, nickname, avatar } = usePlayerStats();

  const [matchState, setMatchState] = useState<MatchState>("searching");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<CpuDifficulty>("medium");
  const [isHost, setIsHost] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isBotGame, setIsBotGame] = useState(false);
  const [botTimeout] = useState(
    () => Math.floor(Math.random() * (BOT_TIMEOUT_MAX - BOT_TIMEOUT_MIN + 1)) + BOT_TIMEOUT_MIN,
  );
  const startedRef = useRef(false);
  const mountedRef = useRef(true);
  const roomIdRef = useRef<string | null>(null);
  const retryRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { room } = useRoomById(roomId ?? undefined);

  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withTiming(0.4, { duration: 1200 }),
      -1,
      true,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  // Search for a match on mount
  const searchForMatch = useCallback(async () => {
    if (!userId) return;

    // Try to find an existing matchmaking room
    const existing = await findMatchmakingRoom(userId);

    if (!mountedRef.current) return;

    if (existing) {
      // Join the existing room
      const result = await joinMatchmakingRoom(
        existing,
        userId,
        nickname || "Player",
        avatar,
      );

      if (!mountedRef.current) return;

      if (result.error) {
        // Room was taken, create our own
        await createOwnRoom();
        return;
      }

      setRoomId(result.roomId);
      setDifficulty(existing.difficulty as CpuDifficulty);
      setIsHost(false);
      setMatchState("found");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // No room found, create our own and wait
      await createOwnRoom();
    }
  }, [userId, nickname, avatar]);

  const createOwnRoom = async () => {
    if (!userId) return;

    const result = await createMatchmakingRoom(
      userId,
      nickname || "Player",
      avatar,
    );

    if (!mountedRef.current) return;

    setRoomId(result.roomId);
    setDifficulty(result.difficulty);
    setIsHost(true);
  };

  // Keep roomIdRef in sync for cleanup
  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    mountedRef.current = true;
    searchForMatch();
    return () => {
      mountedRef.current = false;
      // Cleanup: if we leave without starting a game, delete the room
      if (roomIdRef.current && !startedRef.current) {
        deleteRoom(roomIdRef.current);
      }
    };
  }, [searchForMatch]);

  // Elapsed timer (ticks every second while searching)
  useEffect(() => {
    if (matchState !== "searching") return;
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [matchState]);

  // Retry polling: if host waiting, re-search every 4s to find other hosts
  useEffect(() => {
    if (!isHost || matchState !== "searching" || !roomId || !userId) return;

    retryRef.current = setInterval(async () => {
      if (!mountedRef.current || startedRef.current) return;

      const existing = await findMatchmakingRoom(userId);
      if (!mountedRef.current || !existing || startedRef.current) return;

      // Found another room — join it and delete ours
      const result = await joinMatchmakingRoom(
        existing,
        userId,
        nickname || "Player",
        avatar,
      );

      if (!mountedRef.current || startedRef.current) return;

      if (!result.error) {
        // Delete our own room, switch to the found one
        deleteRoom(roomId);
        startedRef.current = true;
        setRoomId(result.roomId);
        setDifficulty(existing.difficulty as CpuDifficulty);
        setIsHost(false);
        setMatchState("found");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 4000);

    return () => {
      if (retryRef.current) clearInterval(retryRef.current);
    };
  }, [isHost, matchState, roomId, userId, nickname, avatar]);

  // Bot fallback: after random timeout without match, inject a fake guest
  useEffect(() => {
    if (elapsed < botTimeout || !isHost || !roomId || startedRef.current || matchState !== "searching") return;

    const injectBot = async () => {
      startedRef.current = true;
      const fakeName = randomFakeName();
      const fakeAvatar = randomFakeAvatar();
      const fakeGuestId = id();

      // Write fake guest into the room
      await db.transact(
        tx.rooms[roomId].update({
          guestId: fakeGuestId,
          guestNickname: fakeName,
          guestAvatar: fakeAvatar,
        }),
      );

      if (!mountedRef.current) return;

      setIsBotGame(true);
      setMatchState("found");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Start the game after a short delay
      setTimeout(() => {
        if (!mountedRef.current) return;
        startRoom(roomId, difficulty, userId!, fakeGuestId);
        setMatchState("countdown");
      }, 1500);
    };

    injectBot();
  }, [elapsed, isHost, roomId, matchState, difficulty, userId]);

  // Host: watch for guest joining → auto-start
  useEffect(() => {
    if (!isHost || !room || !room.guestId || startedRef.current || !roomId) return;

    startedRef.current = true;
    setMatchState("found");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Small delay then start
    const timer = setTimeout(() => {
      if (!mountedRef.current) return;
      startRoom(roomId, difficulty, room.hostId, room.guestId!);
      setMatchState("countdown");
    }, 1500);

    return () => clearTimeout(timer);
  }, [room?.guestId, isHost, roomId, difficulty]);

  // Guest: watch for status="playing" → show countdown
  useEffect(() => {
    if (isHost || !room || room.status !== "playing") return;
    setMatchState("countdown");
  }, [room?.status, isHost]);

  const handleCountdownComplete = () => {
    if (!room) return;
    // Prevent unmount cleanup from deleting the room during navigation
    startedRef.current = true;
    router.replace({
      pathname: "/game/online",
      params: {
        roomCode: room.code,
        difficulty,
        ...(isBotGame && { botMode: "1" }),
      },
    });
  };

  const handleCancel = () => {
    if (roomId) deleteRoom(roomId);
    router.back();
  };

  // Countdown overlay
  if (matchState === "countdown" && room) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
        <CountdownOverlay
          hostAvatar={room.hostAvatar}
          hostNickname={room.hostNickname}
          guestAvatar={room.guestAvatar ?? "🧠"}
          guestNickname={room.guestNickname ?? "Player"}
          firstPlayerName={
            room.currentPlayerId === room.hostId
              ? room.hostNickname
              : room.guestNickname ?? "Player"
          }
          onComplete={handleCountdownComplete}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: 16 }}>
        <Pressable
          onPress={handleCancel}
          hitSlop={16}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 10,
            backgroundColor: colors.surfaceContainer,
            alignSelf: "flex-start",
          }}
        >
          <Text style={{ fontSize: 18, color: colors.onSurfaceVariant, marginRight: 4 }}>←</Text>
          <Text style={{ fontSize: 14, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant }}>
            {t("game.menu")}
          </Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        {matchState === "searching" && (
          <>
            <Text style={{ fontSize: 48, marginBottom: 24 }}>🎲</Text>
            <Animated.Text
              style={[
                pulseStyle,
                {
                  fontSize: 18,
                  fontFamily: "Fredoka_700Bold",
                  color: colors.onSurface,
                  marginBottom: 8,
                },
              ]}
            >
              {t("room.searching")}
            </Animated.Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Nunito_400Regular",
                color: colors.onSurfaceVariant,
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              {t("room.searchingDesc")}
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontFamily: "Fredoka_600SemiBold",
                color: colors.onSurfaceVariant,
                marginBottom: 40,
              }}
            >
              {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
            </Text>
          </>
        )}

        {matchState === "found" && room && (
          <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 48, marginBottom: 24 }}>🎯</Text>
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Fredoka_700Bold",
                color: colors.primaryContainer,
                marginBottom: 8,
              }}
            >
              {t("room.found")}
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Nunito_600SemiBold",
                color: colors.onSurfaceVariant,
              }}
            >
              vs {isHost ? room.guestNickname : room.hostNickname}
            </Text>
          </Animated.View>
        )}

        {matchState === "searching" && (
          <Button icon="✕" text={t("room.cancel")} variant="ghost" onPress={handleCancel} />
        )}
      </View>
    </SafeAreaView>
  );
}
