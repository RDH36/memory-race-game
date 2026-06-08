import { useState, useEffect } from "react";
import { Text, View, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats } from "../../lib/playerStats";
import { haptics } from "@/lib/haptics";
import { joinRoom, useRoom } from "../../lib/roomLogic";
import { CountdownOverlay } from "../../components/room/CountdownOverlay";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { Btn3D, ScreenHeader } from "@/components/ui/arcade";

const ERROR_ICONS: Record<string, string> = {
  notFound: "🔍",
  full: "🚫",
  started: "⏳",
  versionOld: "⬆️",
  versionNew: "⬇️",
  joinFailed: "📡",
};

export default function JoinRoomScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
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
      haptics.miss();
      setLoading(false);
      return;
    }

    haptics.match();
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
          <Text style={{ fontSize: 16, fontFamily: "Fredoka_700Bold", color: colors.onSurfaceVariant }}>
            {t("room.waitingHost")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
        <ScreenHeader title={t("room.joinRoom")} onBack={() => router.back()} />

        <View style={{ alignItems: "center", marginTop: 30 }}>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Fredoka_700Bold",
              color: colors.onSurfaceMuted,
              letterSpacing: 1,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            {t("room.joinSubtitle")}
          </Text>

          <TextInput
            value={code}
            onChangeText={(text) => {
              setCode(text.toUpperCase().slice(0, 6));
            }}
            placeholder="ABCDEF"
            placeholderTextColor={colors.onSurfaceMuted}
            autoCapitalize="characters"
            maxLength={6}
            style={{
              fontSize: 34,
              fontFamily: "Fredoka_700Bold",
              color: colors.primary,
              textAlign: "center",
              letterSpacing: 10,
              backgroundColor: colors.surfaceContainer,
              paddingHorizontal: 24,
              paddingVertical: 18,
              borderRadius: 18,
              width: "100%",
              marginBottom: 20,
              boxShadow: `0 3px 0 ${colors.panelLip}, 0 10px 22px -12px ${colors.panelShadow}`,
            }}
          />

          <Btn3D
            color="green"
            size="lg"
            full
            label={t("room.join")}
            loading={loading}
            disabled={code.length !== 6}
            onPress={handleJoin}
          >
            <Text style={{ fontSize: 18 }}>🎮</Text>
          </Btn3D>
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
