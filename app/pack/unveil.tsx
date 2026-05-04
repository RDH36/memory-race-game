import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter, Redirect } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  cancelAnimation,
} from "react-native-reanimated";
import { Gradient } from "../../components/ui/Gradient";
import { ConfettiParticles } from "../../components/result/ConfettiParticles";
import { PremiumHalo } from "../../components/appearance/PremiumHalo";
import { PremiumDecor } from "../../components/appearance/PremiumDecor";
import { PACKS } from "../../lib/packs";
import { AVATAR_SKINS, type PackId } from "../../lib/skins";
import { usePlayerStats } from "../../lib/playerStats";
import { saveProfile } from "../../lib/identity";

export default function UnveilScreen() {
  const { packId } = useLocalSearchParams<{ packId?: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { userId, profileId } = usePlayerStats();

  const avatarScale = useSharedValue(0.4);
  const avatarOpacity = useSharedValue(0);
  const avatarRotate = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslate = useSharedValue(20);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslate = useSharedValue(30);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    avatarOpacity.value = withTiming(1, { duration: 300 });
    avatarScale.value = withSpring(1, { damping: 7, stiffness: 130 });
    avatarRotate.value = withRepeat(
      withTiming(0.04, { duration: 1500 }),
      -1,
      true,
    );
    titleOpacity.value = withDelay(350, withTiming(1, { duration: 400 }));
    titleTranslate.value = withDelay(350, withSpring(0, { damping: 14 }));
    buttonsOpacity.value = withDelay(700, withTiming(1, { duration: 400 }));
    buttonsTranslate.value = withDelay(700, withSpring(0, { damping: 14 }));
    return () => {
      cancelAnimation(avatarRotate);
      cancelAnimation(avatarScale);
      cancelAnimation(avatarOpacity);
      cancelAnimation(titleOpacity);
      cancelAnimation(titleTranslate);
      cancelAnimation(buttonsOpacity);
      cancelAnimation(buttonsTranslate);
    };
  }, []);

  const avatarStyle = useAnimatedStyle(() => ({
    opacity: avatarOpacity.value,
    transform: [{ scale: avatarScale.value }, { rotate: `${avatarRotate.value}rad` }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslate.value }],
  }));
  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslate.value }],
  }));

  if (!packId || !(packId in PACKS)) return <Redirect href="/(tabs)" />;

  const pack = PACKS[packId as PackId];
  const skin = AVATAR_SKINS.find((a) => a.emoji === pack.emoji);

  if (!skin?.requires) return <Redirect href="/(tabs)" />;

  const equip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (userId) {
      await saveProfile(userId, profileId, { avatar: skin.id });
    }
    router.replace("/(tabs)");
  };

  const skipEquip = () => {
    Haptics.selectionAsync();
    router.replace("/(tabs)");
  };

  return (
    <View style={{ flex: 1, backgroundColor: pack.gradient[0] }}>
      <StatusBar style="light" />
      <Gradient
        colors={[pack.gradient[0], pack.gradient[1]]}
        angle={pack.gradientAngle}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View
        pointerEvents="none"
        style={{ position: "absolute", top: -120, left: 0, right: 0, alignItems: "center" }}
      >
        <View
          style={{
            width: 420,
            height: 420,
            borderRadius: 210,
            backgroundColor: pack.glow,
            opacity: 0.18,
          }}
        />
      </View>

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 28,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Nunito_700Bold",
              letterSpacing: 2,
              color: pack.glow,
              opacity: 0.95,
              marginBottom: 24,
            }}
          >
            ● {t("unveil.eyebrow")} ●
          </Text>

          <View
            style={{
              width: 240,
              height: 240,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <PremiumHalo entitlement={skin.requires} size={240} animate />
            <View
              pointerEvents="none"
              style={{ position: "absolute", top: 60, left: 0, right: 0, alignItems: "center" }}
            >
              <ConfettiParticles />
            </View>
            <Animated.View style={avatarStyle}>
              <View
                style={{
                  width: 144,
                  height: 144,
                  borderRadius: 36,
                  backgroundColor: `hsl(${skin.hue}, 60%, 70%)`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 92, lineHeight: 110 }}>{skin.emoji}</Text>
                <PremiumDecor entitlement={skin.requires} size={144} borderRadius={36} animateAura />
              </View>
            </Animated.View>
          </View>

          <Animated.View style={[titleStyle, { alignItems: "center" }]}>
            <Text
              style={{
                fontSize: 30,
                fontFamily: "Fredoka_700Bold",
                color: "#FFFFFF",
                textAlign: "center",
                letterSpacing: 0.3,
              }}
            >
              {t("unveil.title")}
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontSize: 14,
                fontFamily: "Nunito_600SemiBold",
                color: "rgba(255,255,255,0.82)",
                textAlign: "center",
              }}
            >
              {t("unveil.subtitle")}
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              buttonsStyle,
              { width: "100%", marginTop: 36, gap: 10 },
            ]}
          >
            <Pressable
              onPress={equip}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <View
                style={{
                  backgroundColor: pack.cta,
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: "Nunito_700Bold",
                    color: pack.ctaText,
                    letterSpacing: 0.3,
                  }}
                >
                  {t("unveil.equip")}
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={skipEquip}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View
                style={{
                  paddingVertical: 14,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Nunito_600SemiBold",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {t("unveil.later")}
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
