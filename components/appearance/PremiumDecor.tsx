import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from "react-native-svg";
import { getAvatarSkin, type EntitlementKey } from "../../lib/skins";
import { getPremiumTheme, getPremiumThemeForEmoji } from "../../lib/premiumTheme";
import { AnimatedAura } from "./AnimatedAura";
import { ShapeAura } from "./ShapeAura";

interface BaseProps {
  size: number;
  borderRadius: number;
  /** Stroke width for the gradient border (default scales with size) */
  strokeWidth?: number;
  /** Hide the corner premium badge */
  hideBadge?: boolean;
  /** Hide the outer soft glow behind the tile */
  hideOuterGlow?: boolean;
  /** Render animated themed shape aura around the tile */
  animateAura?: boolean;
  /** When true, shape aura orbits at the tile edge (for compact contexts) */
  auraInset?: boolean;
  /** When true, shapes are clipped at tile bounds (prevents overflow into adjacent content) */
  clipAura?: boolean;
}

interface ByEntitlementProps extends BaseProps {
  entitlement: EntitlementKey;
  emoji?: never;
}

interface ByEmojiProps extends BaseProps {
  emoji: string;
  entitlement?: never;
}

type Props = ByEntitlementProps | ByEmojiProps;

/**
 * Themed gradient border + corner badge overlay for non-circular avatars
 * (HUD, leaderboard, profile). Renders nothing when the avatar isn't a paid skin.
 * Place as the LAST child of the avatar container so it sits on top.
 */
export function PremiumDecor(props: Props) {
  const theme =
    "entitlement" in props && props.entitlement
      ? getPremiumTheme(props.entitlement)
      : "emoji" in props && props.emoji
        ? getPremiumThemeForEmoji(props.emoji)
        : null;

  if (!theme) return null;

  const { size, borderRadius, hideBadge, hideOuterGlow, animateAura, auraInset, clipAura } = props;
  const strokeWidth = props.strokeWidth ?? Math.max(3, size * 0.09);
  const badgeSize = Math.max(14, size * 0.34);
  const glowExt = Math.max(5, size * 0.18);
  const gradId = `premium-decor-${"entitlement" in props ? props.entitlement : props.emoji}-${size}`;
  const resolvedEntitlement: EntitlementKey | undefined =
    "entitlement" in props && props.entitlement
      ? props.entitlement
      : "emoji" in props && props.emoji
        ? (getAvatarSkin(props.emoji)?.requires ?? undefined)
        : undefined;

  return (
    <>
      {/* Outer treatment — single static glow + ShapeAura when animated */}
      {!hideOuterGlow && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -glowExt * 0.5,
            left: -glowExt * 0.5,
            width: size + glowExt,
            height: size + glowExt,
            borderRadius: borderRadius + glowExt * 0.5,
            backgroundColor: theme.haloColor,
            opacity: 0.28,
          }}
        />
      )}
      {animateAura && resolvedEntitlement && (
        clipAura ? (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: size,
              height: size,
              borderRadius,
              overflow: "hidden",
            }}
          >
            <ShapeAura entitlement={resolvedEntitlement} size={size} inset={auraInset} />
          </View>
        ) : (
          <ShapeAura entitlement={resolvedEntitlement} size={size} inset={auraInset} />
        )
      )}

      {/* Metallic gradient border (5-stop highlight/shadow alternation) */}
      <Svg
        width={size}
        height={size}
        style={{ position: "absolute", top: 0, left: 0 }}
        pointerEvents="none"
      >
        <Defs>
          <SvgLinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={theme.borderGradient[0]} />
            <Stop offset="30%" stopColor={theme.borderGradient[1]} />
            <Stop offset="50%" stopColor={theme.borderGradient[0]} />
            <Stop offset="70%" stopColor={theme.borderGradient[1]} />
            <Stop offset="100%" stopColor={theme.borderGradient[0]} />
          </SvgLinearGradient>
        </Defs>
        <Rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={size - strokeWidth}
          height={size - strokeWidth}
          rx={borderRadius}
          ry={borderRadius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
        />
      </Svg>

      {!hideBadge && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: -4,
            right: -4,
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: theme.badgeBg,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            borderColor: "#FFFFFF",
          }}
        >
          <Ionicons name={theme.badgeIcon} size={badgeSize * 0.55} color={theme.badgeFg} />
        </View>
      )}
    </>
  );
}
