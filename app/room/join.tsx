import { useState, useEffect } from "react";
import { Text, View, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { joinRoom, useRoom } from "../../lib/roomLogic";
import { CountdownOverlay } from "../../components/room/CountdownOverlay";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { Button } from "../../components/ui/Button";

const ERROR_ICONS: Record<string, string> = {
  notFound: "🔍",
  full: "🚫",
  started: "⏳",
  versionOld: "⬆️",
  versionNew: "⬇️",
};

export default function JoinRoomScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { userId, nickname, avatar } = usePlayerStats();

  const [code, setCode] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [joinedCode, setJoinedCode] = useState<string | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);

  const { room } = useRoom(joinedCode ?? undefined);

  // Watch for game start (host starts the game)
  useEffect(() => {
    if (!room || room.status !== "playing" || showCountdown) return;
    setShowCountdown(true);
  }, [room?.status]);

  const handleJoin = async () => {
    if (code.length !== 6 || !userId || loading) return;
    setLoading(true);
    setErrorKey(null);

    const result = await joinRoom(code.toUpperCase(), userId, nickname || "Guest", avatar);

    if (result.error) {
      setErrorKey(result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setLoading(false);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setJoinedCode(code.toUpperCase());
    setLoading(false);
  };

  const handleCountdownComplete = () => {
    router.replace({
      pathname: "/game/online",
      params: { roomCode: joinedCode!, difficulty: room?.difficulty ?? "medium" },
    });
  };

  // Countdown overlay
  if (showCountdown && room) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
        <CountdownOverlay
          hostAvatar={room.hostAvatar}
          hostNickname={room.hostNickname}
          guestAvatar={room.guestAvatar ?? avatar}
          guestNickname={room.guestNickname ?? (nickname || "Guest")}
          firstPlayerName={
            room.currentPlayerId === room.hostId
              ? room.hostNickname
              : room.guestNickname ?? (nickname || "Guest")
          }
          onComplete={handleCountdownComplete}
        />
      </SafeAreaView>
    );
  }

  // Waiting for host to start
  if (joinedCode) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ fontSize: 16, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant }}>
            {t("room.waitingHost")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        <Pressable onPress={() => router.back()} hitSlop={16}
          style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: colors.surfaceContainer, alignSelf: "flex-start", marginBottom: 32 }}
        >
          <Text style={{ fontSize: 18, color: colors.onSurfaceVariant, marginRight: 4 }}>←</Text>
          <Text style={{ fontSize: 14, fontFamily: "Nunito_600SemiBold", color: colors.onSurfaceVariant }}>{t("game.menu")}</Text>
        </Pressable>

        <View style={{ alignItems: "center", marginTop: 40 }}>
          <Text style={{ fontSize: 24, fontFamily: "Fredoka_700Bold", color: colors.onSurface, marginBottom: 8 }}>
            {t("room.joinTitle")}
          </Text>
          <Text style={{ fontSize: 14, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginBottom: 32 }}>
            {t("room.joinSubtitle")}
          </Text>

          <TextInput
            value={code}
            onChangeText={(text) => {
              setCode(text.toUpperCase().slice(0, 6));
            }}
            placeholder="ABCDEF"
            placeholderTextColor={colors.onSurfaceVariant}
            autoCapitalize="characters"
            maxLength={6}
            style={{
              fontSize: 32,
              fontFamily: "Fredoka_700Bold",
              color: colors.primaryContainer,
              textAlign: "center",
              letterSpacing: 8,
              backgroundColor: isDark ? "#1E1E1E" : "#F5F2F2",
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderRadius: 16,
              width: "100%",
              marginBottom: 12,
            }}
          />

          <View style={{ width: "100%", marginTop: 8 }}>
            <Button
              icon="🎮"
              text={t("room.join")}
              loading={loading}
              disabled={code.length !== 6}
              onPress={handleJoin}
            />
          </View>
        </View>
      </View>

      <ConfirmModal
        visible={!!errorKey}
        icon={ERROR_ICONS[errorKey ?? ""] ?? "❌"}
        title={t("room.errorTitle")}
        message={errorKey ? t(`room.error.${errorKey}`) : ""}
        cancelText=""
        confirmText="OK"
        onCancel={() => setErrorKey(null)}
        onConfirm={() => setErrorKey(null)}
      />
    </SafeAreaView>
  );
}
