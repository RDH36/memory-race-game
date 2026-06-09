import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import { Btn3D } from "@/components/ui/arcade";
import type { AbilityState } from "@/lib/abilities";
import { InfoSection, LevelsSection } from "@/components/builds/AbilityInfoSections";

export function AbilityInfoModal({
  ability,
  onClose,
}: {
  ability: AbilityState | null;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const visible = ability != null;

  const scale = useSharedValue(0.82);
  const opacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 13, stiffness: 190 });
      opacity.value = withTiming(1, { duration: 180 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.82, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!ability) return null;
  const [base, lip] = colors.hues[ability.hue];

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 26 }}
      >
        <Animated.View
          style={[overlayStyle, { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(20,12,40,0.62)" }]}
        />
        <Pressable onPress={() => {}} style={{ width: "100%", maxHeight: "90%" }}>
          <Animated.View
            style={[
              cardStyle,
              {
                backgroundColor: colors.surfaceContainer,
                borderRadius: 28,
                width: "100%",
                flexShrink: 1,
                minHeight: 0,
                overflow: "hidden",
                boxShadow: `0 6px 0 ${colors.panelLip}, 0 20px 40px -12px ${colors.panelShadow}`,
              },
            ]}
          >
            {/* Arcade hero band — hue colored with gloss + big emoji */}
            <View style={{ backgroundColor: base, paddingTop: 22, paddingBottom: 26, alignItems: "center" }}>
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: "10%",
                  right: "10%",
                  top: 8,
                  height: "32%",
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.25)",
                }}
              />
              {/* close chip */}
              <Pressable
                onPress={onClose}
                hitSlop={10}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: "rgba(255,255,255,0.28)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 16, color: "#fff" }}>✕</Text>
              </Pressable>

              <View
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 24,
                  backgroundColor: colors.surfaceContainer,
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 0 ${lip}`,
                }}
              >
                <Text style={{ fontSize: 40 }}>{ability.emoji}</Text>
              </View>
              <Text style={{ fontSize: 22, fontFamily: "Fredoka_700Bold", color: "#fff", marginTop: 12 }}>
                {t(`abilities.${ability.nameKey}.name`)}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 8,
                  backgroundColor: "rgba(255,255,255,0.24)",
                  borderRadius: 999,
                  paddingVertical: 5,
                  paddingLeft: 6,
                  paddingRight: 14,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "rgba(255,255,255,0.9)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 19 }}>{ability.avatarId}</Text>
                </View>
                <Text style={{ fontSize: 12.5, fontFamily: "Fredoka_700Bold", color: "#fff" }}>
                  {t("builds.linkedAvatar")}
                </Text>
              </View>
            </View>

            {/* Body — scroll area shrinks to fit, button stays pinned */}
            <View style={{ padding: 18, flexShrink: 1, minHeight: 0 }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ flexShrink: 1, minHeight: 0 }}
                contentContainerStyle={{ paddingBottom: 4 }}
              >
                <Text style={{ fontSize: 13.5, lineHeight: 20, fontFamily: "Nunito_700Bold", color: colors.onSurfaceVariant, textAlign: "center" }}>
                  {t(`abilities.${ability.nameKey}.desc`)}
                </Text>
                <InfoSection icon="📖" label={t("builds.story")} text={t(`abilities.${ability.nameKey}.story`)} hue={ability.hue} />
                <InfoSection icon="⏱️" label={t("builds.timing")} text={t(`abilities.${ability.nameKey}.timing`)} hue={ability.hue} />
                <LevelsSection ability={ability} />
              </ScrollView>

              <Btn3D color={ability.hue} size="md" full label={t("builds.gotIt")} onPress={onClose} style={{ marginTop: 16 }} />
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
