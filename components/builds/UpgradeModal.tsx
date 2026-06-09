import { Modal, Pressable, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import { Btn3D, Stars } from "@/components/ui/arcade";
import type { AbilityState } from "@/lib/abilities";

export function UpgradeModal({
  ability,
  gold,
  onConfirm,
  onClose,
}: {
  ability: AbilityState | null;
  gold: number;
  onConfirm: (a: AbilityState) => void;
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
  const [base, lip, tint] = colors.hues[ability.hue];
  const nextLevel = ability.level + 1;
  const cost = ability.nextUpgradeCost ?? 0;
  const canAfford = gold >= cost;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 28 }}
      >
        <Animated.View
          style={[overlayStyle, { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(20,12,40,0.62)" }]}
        />
        <Pressable onPress={() => {}} style={{ width: "100%" }}>
          <Animated.View
            style={[
              cardStyle,
              {
                backgroundColor: colors.surfaceContainer,
                borderRadius: 26,
                padding: 22,
                width: "100%",
                alignItems: "center",
                boxShadow: `0 6px 0 ${colors.panelLip}, 0 20px 40px -12px ${colors.panelShadow}`,
              },
            ]}
          >
            <View
              style={{
                width: 66,
                height: 66,
                borderRadius: 22,
                backgroundColor: tint,
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `inset 0 0 0 3px ${base}, 0 4px 0 ${lip}`,
              }}
            >
              <Text style={{ fontSize: 36 }}>{ability.emoji}</Text>
            </View>

            <Text style={{ fontSize: 12, fontFamily: "Fredoka_700Bold", letterSpacing: 0.5, color: colors.onSurfaceVariant, textTransform: "uppercase", marginTop: 12 }}>
              {t("builds.upgradeTitle")}
            </Text>
            <Text style={{ fontSize: 19, fontFamily: "Fredoka_700Bold", color: colors.onSurface, marginTop: 2 }}>
              {t(`abilities.${ability.nameKey}.name`)}
            </Text>

            {/* Level transition */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 }}>
              <Stars n={ability.level} max={ability.maxLevel} size={16} />
              <Text style={{ fontSize: 18, fontFamily: "Fredoka_700Bold", color: base }}>→</Text>
              <Stars n={nextLevel} max={ability.maxLevel} size={16} />
            </View>

            {/* Next-level effect */}
            <View
              style={{
                width: "100%",
                marginTop: 16,
                backgroundColor: tint,
                borderRadius: 18,
                padding: 14,
                boxShadow: `0 3px 0 ${lip}22`,
              }}
            >
              <Text style={{ fontSize: 11.5, fontFamily: "Fredoka_700Bold", letterSpacing: 0.4, color: base, textTransform: "uppercase", marginBottom: 5 }}>
                {t("builds.upgradeTo", { n: nextLevel })}
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 20, fontFamily: "Nunito_700Bold", color: colors.onSurface }}>
                {t(`abilities.${ability.nameKey}.levels.${nextLevel}`)}
              </Text>
            </View>

            {!canAfford && (
              <Text style={{ fontSize: 12, fontFamily: "Nunito_700Bold", color: colors.error, marginTop: 12 }}>
                {t("builds.notEnoughGold")}
              </Text>
            )}

            {/* Actions */}
            <View style={{ flexDirection: "row", gap: 10, width: "100%", marginTop: 18 }}>
              <Btn3D color="white" size="md" label={t("builds.cancel")} onPress={onClose} style={{ flex: 1 }} />
              <Btn3D
                color={ability.hue}
                size="md"
                label={`🪙 ${cost}`}
                disabled={!canAfford}
                onPress={() => onConfirm(ability)}
                style={{ flex: 1 }}
              />
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
