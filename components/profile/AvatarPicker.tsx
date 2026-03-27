import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../lib/ThemeContext";
import { usePlayerStats, AVATARS } from "../../lib/playerStats";
import { saveProfile } from "../../lib/identity";
import { BottomSheet } from "../ui/BottomSheet";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AvatarPicker({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { avatar: current, userId, profileId } = usePlayerStats();

  const handleSelect = (emoji: string) => {
    if (!userId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    saveProfile(userId, profileId, { avatar: emoji });
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("avatarPicker.title")}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
        {AVATARS.map((emoji) => (
          <Pressable
            key={emoji}
            onPress={() => handleSelect(emoji)}
            style={({ pressed }) => ({
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: emoji === current ? colors.primaryContainerBg : colors.surface,
              borderWidth: emoji === current ? 2 : 0,
              borderColor: colors.primaryContainer,
              alignItems: "center",
              justifyContent: "center",
              transform: [{ scale: pressed ? 0.9 : 1 }],
            })}
          >
            <Text style={{ fontSize: 28 }}>{emoji}</Text>
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}
