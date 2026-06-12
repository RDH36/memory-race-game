// Small story-battle chrome: enemy taunt bubble, top bar and quit modal.
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import { IconBtn } from "@/components/ui/arcade";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { LivesPill } from "@/components/story/lives";

/** "Abandon the fight?" confirmation. */
export function BattleQuitModal({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ConfirmModal
      visible={visible}
      icon="🏳️"
      title={t("room.quitTitle")}
      message={t("room.quitMessage")}
      cancelText={t("room.quitCancel")}
      confirmText={t("room.quitConfirm")}
      confirmIcon="🚪"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

/** Quit button + hearts balance row above the battle HUD. */
export function BattleTopBar({ onQuit }: { onQuit: () => void }) {
  return (
    <View
      style={{
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <IconBtn color="white" onPress={onQuit}>
        ✕
      </IconBtn>
      <LivesPill />
    </View>
  );
}

export function BattleTauntBanner({ avatar, text }: { avatar: string; text: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        marginTop: 10,
        backgroundColor: colors.hues.coral[0],
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 16,
        boxShadow: `0 4px 0 ${colors.hues.coral[1]}`,
      }}
    >
      <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 14, color: "#fff", textAlign: "center" }}>
        {avatar} {text}
      </Text>
    </View>
  );
}
