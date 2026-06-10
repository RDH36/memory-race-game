import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import { haptics } from "@/lib/haptics";
import { Avatar, Btn3D, Panel, Ribbon, Stars } from "@/components/ui/arcade";
import type { AbilityState } from "@/lib/abilities";

function InfoButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptics.select();
        onPress();
      }}
      hitSlop={8}
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: 5,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: colors.surfaceContainerLow,
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 2px 0 ${colors.panelLip}`,
      }}
    >
      <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 13, color: colors.onSurfaceVariant }}>?</Text>
    </Pressable>
  );
}

function AbilityBadge({ emoji, avatarId, hue }: { emoji: string; avatarId: string; hue: AbilityState["hue"] }) {
  const { colors } = useTheme();
  const [c, cd] = colors.hues[hue];
  return (
    <View style={{ position: "relative" }}>
      <Avatar emoji={emoji} color={hue} size={54} />
      {/* linked avatar — small framed chip on the corner */}
      <View
        style={{
          position: "absolute",
          bottom: -5,
          right: -5,
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: colors.surfaceContainer,
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `inset 0 0 0 2px ${c}, 0 2px 0 ${cd}`,
        }}
      >
        <Text style={{ fontSize: 13 }}>{avatarId}</Text>
      </View>
    </View>
  );
}

export function AbilityCard({
  ability,
  gold,
  width,
  onEquip,
  onUnlock,
  onUpgrade,
  onInfo,
  onQuestNav,
}: {
  ability: AbilityState;
  gold: number;
  width: number;
  onEquip: (a: AbilityState) => void;
  onUnlock: (a: AbilityState) => void;
  onUpgrade: (a: AbilityState) => void;
  onInfo: (a: AbilityState) => void;
  onQuestNav: (a: AbilityState) => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const { owned, equipped, level, maxLevel, baseCost, questLocked } = ability;
  const canAffordUnlock = gold >= baseCost;
  const isMax = owned && level >= maxLevel;
  const lockedByQuest = !owned && questLocked;

  return (
    <View style={{ width, opacity: owned ? 1 : 0.94 }}>
      <Panel
        style={{
          padding: 12,
          gap: 6,
          alignItems: "center",
        }}
      >
        <InfoButton onPress={() => onInfo(ability)} />

        {/* State ribbon */}
        {ability.default ? (
          <Ribbon color="blue">{t("builds.default")}</Ribbon>
        ) : equipped ? (
          <Ribbon color="green">{t("builds.equipped")}</Ribbon>
        ) : lockedByQuest ? (
          <Ribbon color="violet">{t("builds.questRibbon")}</Ribbon>
        ) : !owned ? (
          <Ribbon color="white">{t("builds.locked")}</Ribbon>
        ) : (
          <View style={{ height: 18 }} />
        )}

        <AbilityBadge emoji={ability.emoji} avatarId={ability.avatarId} hue={ability.hue} />

        <Text
          numberOfLines={1}
          style={{ fontSize: 15, fontFamily: "Fredoka_700Bold", color: colors.onSurface, textAlign: "center" }}
        >
          {t(`abilities.${ability.nameKey}.name`)}
        </Text>

        <Text
          numberOfLines={2}
          style={{
            fontSize: 11.5,
            lineHeight: 15,
            fontFamily: "Nunito_600SemiBold",
            color: colors.onSurfaceMuted,
            textAlign: "center",
            minHeight: 30,
          }}
        >
          {t(`abilities.${ability.nameKey}.desc`)}
        </Text>

        {owned ? <Stars n={level} max={maxLevel} size={13} /> : <View style={{ height: 13 }} />}

        {/* Action */}
        <View style={{ width: "100%", marginTop: 2 }}>
          {lockedByQuest ? (
            <Btn3D
              color="violet"
              size="md"
              full
              label={t("builds.unlockViaQuest")}
              onPress={() => onQuestNav(ability)}
            />
          ) : !owned ? (
            <Btn3D
              color="gold"
              size="md"
              full
              label={`🪙 ${baseCost}`}
              disabled={!canAffordUnlock}
              onPress={() => onUnlock(ability)}
            />
          ) : (
            <View style={{ flexDirection: "row", gap: 7, alignItems: "stretch" }}>
              {/* Equip / equipped state */}
              {equipped ? (
                <View
                  style={{
                    flex: 1,
                    borderRadius: 13,
                    backgroundColor: colors.hues.green[2],
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 13, color: colors.hues.green[1] }}>
                    ✓ {t("builds.equippedLabel")}
                  </Text>
                </View>
              ) : (
                <Btn3D
                  color="violet"
                  size="sm"
                  label={t("builds.equip")}
                  onPress={() => onEquip(ability)}
                  style={{ flex: 1 }}
                  textStyle={{ textAlign: "center" }}
                />
              )}

              {/* Upgrade — opens the upgrade modal */}
              {isMax ? (
                <View
                  style={{
                    paddingHorizontal: 12,
                    borderRadius: 13,
                    backgroundColor: colors.surfaceContainerLow,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 14 }}>👑</Text>
                </View>
              ) : (
                <Btn3D color="gold" size="sm" label="⬆" onPress={() => onUpgrade(ability)} />
              )}
            </View>
          )}
        </View>
      </Panel>
    </View>
  );
}
