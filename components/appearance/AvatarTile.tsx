import { memo } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { AvatarSkin } from "../../lib/skins";
import { getPremiumTheme } from "../../lib/premiumTheme";
import { PremiumHalo } from "./PremiumHalo";
import { PremiumDecor } from "./PremiumDecor";

interface Props {
  avatar: AvatarSkin & { unlocked: boolean };
  size?: number;
  /** Selection ring color — null/undefined = no ring */
  ring?: string | null;
  /** Show lock overlay when avatar is locked */
  showLock?: boolean;
  /** Render an animated halo behind premium avatars (only when unlocked) */
  animatePremiumHalo?: boolean;
  /** Hide the corner premium badge (e.g. when context already screams premium) */
  hidePremiumBadge?: boolean;
}

/**
 * Round avatar tile — pastel hue background + emoji centered.
 * Locked: emoji visible (slightly faded) + small gold lock badge in the corner
 * so users can preview what they'd unlock.
 * Unlocked premium: themed gradient ring + premium badge replaces the lock badge.
 */
function AvatarTileImpl({
  avatar,
  size = 44,
  ring,
  showLock = true,
  animatePremiumHalo = false,
  hidePremiumBadge = false,
}: Props) {
  const bg = avatar.neutral ? "#F0EAE6" : `hsl(${avatar.hue}, 60%, 88%)`;
  const isLocked = showLock && !avatar.unlocked;
  const premium = getPremiumTheme(avatar.requires);
  const isPaid = !!premium;
  const showPremiumBadge = isPaid && avatar.unlocked;

  // Themed ring renders for ALL paid avatars (locked or not) to signal premium content
  // Selection ring (when explicitly passed) takes precedence
  const explicitRing = ring !== undefined && ring !== null;
  const showPremiumRing = isPaid && !explicitRing;
  const ringWidth = ring ? 3 : 0;
  const outerSize = size + ringWidth * 2;
  const emojiSize = size * 0.6;
  const cornerBadgeSize = Math.max(14, size * 0.32);

  return (
    <View
      style={{
        width: outerSize,
        height: outerSize,
        borderRadius: outerSize / 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isPaid && animatePremiumHalo && (
        <PremiumHalo entitlement={avatar.requires!} size={outerSize * 2.2} animate />
      )}

      {showPremiumRing && (
        <PremiumDecor
          entitlement={avatar.requires!}
          size={outerSize}
          borderRadius={outerSize / 2}
          hideBadge
          animateAura
        />
      )}

      {ring && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
            backgroundColor: ring,
          }}
        />
      )}

      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          overflow: "visible",
        }}
      >
        <Text
          style={{
            fontSize: emojiSize,
            lineHeight: emojiSize * 1.18,
            opacity: isLocked ? 0.7 : 1,
          }}
        >
          {avatar.emoji}
        </Text>

        {isLocked && (
          <View
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: cornerBadgeSize,
              height: cornerBadgeSize,
              borderRadius: cornerBadgeSize / 2,
              backgroundColor: "#FFD366",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: "#FFFFFF",
            }}
          >
            <Ionicons name="lock-closed" size={cornerBadgeSize * 0.55} color="#1A1C17" />
          </View>
        )}

        {showPremiumBadge && !hidePremiumBadge && premium && (
          <View
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: cornerBadgeSize,
              height: cornerBadgeSize,
              borderRadius: cornerBadgeSize / 2,
              backgroundColor: premium.badgeBg,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: "#FFFFFF",
            }}
          >
            <Ionicons
              name={premium.badgeIcon}
              size={cornerBadgeSize * 0.55}
              color={premium.badgeFg}
            />
          </View>
        )}
      </View>
    </View>
  );
}

export const AvatarTile = memo(AvatarTileImpl, (prev, next) => {
  return (
    prev.avatar.id === next.avatar.id &&
    prev.avatar.unlocked === next.avatar.unlocked &&
    prev.size === next.size &&
    prev.ring === next.ring &&
    prev.showLock === next.showLock &&
    prev.animatePremiumHalo === next.animatePremiumHalo &&
    prev.hidePremiumBadge === next.hidePremiumBadge
  );
});
