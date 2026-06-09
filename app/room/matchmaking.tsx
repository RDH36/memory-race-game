import { useState, useEffect, useRef, useCallback } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { usePlayerAbilities, randomBotAbility } from "../../lib/abilities";
import {
  findMatchmakingRoom,
  createMatchmakingRoom,
  joinMatchmakingRoom,
  startRoom,
  deleteRoom,
  useRoomById,
} from "../../lib/roomLogic";
import { CountdownOverlay } from "../../components/room/CountdownOverlay";
import { Avatar, Btn3D, IconBtn, Pop } from "@/components/ui/arcade";
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
  const { states, equipped } = usePlayerAbilities();
  const myAb = states.find((s) => s.id === equipped) ?? states[0];
  const hostAbility = { id: myAb.id, level: myAb.level, emoji: myAb.emoji, nameKey: myAb.nameKey };

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
        // Common cases: "full" (room got taken between query and write), "joinFailed"
        // (perms or network), versionOld/versionNew (incompatible client). In all
        // cases, fall back to creating our own room — the retry loop will pick up
        // a compatible host on the next cycle.
        console.warn("[matchmaking] join existing room failed:", result.error);
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
    // Stagger initial search 0-2s to break thundering-herd patterns when
    // many clients hit matchmaking simultaneously.
    const jitter = Math.floor(Math.random() * 2000);
    const startTimer = setTimeout(() => {
      if (mountedRef.current) searchForMatch();
    }, jitter);
    return () => {
      clearTimeout(startTimer);
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
      } else {
        console.warn("[matchmaking] retry-join failed:", result.error);
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
      // Re-check the room before claiming startedRef — a real guest may have joined
      // between our last broadcast and now. Aborting lets the host-watcher effect
      // pick up the legit guest instead of overwriting them.
      const { data } = await db.queryOnce({
        rooms: { $: { where: { id: roomId } } },
      });
      const current = data?.rooms?.[0];
      if (!mountedRef.current || !current || current.guestId) return;

      startedRef.current = true;
      const fakeName = randomFakeName();
      const fakeAvatar = randomFakeAvatar();
      const fakeGuestId = id();

      // Write fake guest into the room
      try {
        await db.transact(
          tx.rooms[roomId].update({
            guestId: fakeGuestId,
            guestNickname: fakeName,
            guestAvatar: fakeAvatar,
          }),
        );
      } catch (e) {
        if (__DEV__) console.warn("[matchmaking bot-inject] transact failed", e);
        startedRef.current = false;
        return;
      }

      if (!mountedRef.current) return;

      setIsBotGame(true);
      setMatchState("found");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Start the game after a short delay
      setTimeout(() => {
        if (!mountedRef.current) return;
        startRoom(roomId, difficulty, userId!, fakeGuestId, hostAbility, randomBotAbility());
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
      startRoom(roomId, difficulty, room.hostId, room.guestId!, hostAbility);
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

  const [violet, violetD] = colors.hues.violet;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: 16 }}>
        <IconBtn color="white" onPress={handleCancel}>
          ‹
        </IconBtn>
      </View>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        {matchState === "searching" && (
          <>
            {/* radar */}
            <View style={{ width: 150, height: 150, marginBottom: 30, alignItems: "center", justifyContent: "center" }}>
              {[0, 1, 2].map((i) => (
                <Animated.View
                  key={i}
                  style={[
                    pulseStyle,
                    {
                      position: "absolute",
                      width: 150,
                      height: 150,
                      borderRadius: 999,
                      borderWidth: 3,
                      borderColor: violet,
                      opacity: 0.5 - i * 0.15,
                      transform: [{ scale: 1 + i * 0.18 }],
                    },
                  ]}
                />
              ))}
              <View
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 999,
                  backgroundColor: violet,
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 8px 0 ${violetD}`,
                }}
              >
                <Text style={{ fontSize: 48 }}>{avatar}</Text>
              </View>
            </View>
            <Animated.Text
              style={[
                pulseStyle,
                { fontSize: 22, fontFamily: "Fredoka_700Bold", color: colors.onSurface, marginBottom: 6 },
              ]}
            >
              {t("room.searching")}
            </Animated.Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Fredoka_700Bold",
                color: colors.onSurfaceMuted,
                textAlign: "center",
                marginBottom: 14,
              }}
            >
              {t("room.searchingDesc")}
            </Text>
            <Text
              style={{ fontSize: 24, fontFamily: "Fredoka_700Bold", color: colors.onSurfaceVariant, marginBottom: 40 }}
            >
              {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
            </Text>
            <Btn3D color="white" size="md" label={t("room.cancel")} onPress={handleCancel} style={{ alignSelf: "center" }} />
          </>
        )}

        {matchState === "found" && room && (
          <Pop style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Fredoka_700Bold",
                letterSpacing: 1.5,
                color: colors.success,
                marginBottom: 18,
              }}
            >
              {t("room.found")}
            </Text>
            <Avatar
              emoji={isHost ? room.guestAvatar ?? "🧠" : room.hostAvatar}
              size={120}
              color="coral"
            />
            <Text
              style={{ fontSize: 24, fontFamily: "Fredoka_700Bold", color: colors.onSurface, marginTop: 16 }}
            >
              {isHost ? room.guestNickname : room.hostNickname}
            </Text>
          </Pop>
        )}
      </View>
    </SafeAreaView>
  );
}
