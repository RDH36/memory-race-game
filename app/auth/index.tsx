import { useState, useEffect } from "react";
import { View, Text, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn, FadeInDown,
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
  withSequence, withSpring, interpolate, runOnJS,
} from "react-native-reanimated";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { db } from "@/lib/instant";
import { useTheme } from "@/lib/ThemeContext";
import { useConnectivity } from "@/lib/ConnectivityContext";
import { radii } from "../../components/ui/theme";
import { Button } from "@/components/ui/Button";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

const SHUFFLE_EMOJIS = ["🦁", "🌸", "⚡", "🎲", "🍕", "🚀"];

interface FlipCardProps {
  finalEmoji: string;
  delay: number;
  endOnBack?: boolean; // true = finit face cachée "?"
  direction?: 1 | -1; // 1 = flip right, -1 = flip left
}

function FlipCard({ finalEmoji, delay, endOnBack = false, direction = 1 }: FlipCardProps) {
  const { colors } = useTheme();
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const [displayEmoji, setDisplayEmoji] = useState(SHUFFLE_EMOJIS[0]);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 8, stiffness: 200 }));

    const target = 180 * direction;
    const flips = [
      { emoji: SHUFFLE_EMOJIS[0], at: delay + 400 },
      { emoji: finalEmoji,        at: delay + 1100 },
    ];

    const timers: NodeJS.Timeout[] = [];

    flips.forEach((flip, i) => {
      timers.push(setTimeout(() => {
        runOnJS(setDisplayEmoji)(flip.emoji);
        rotateY.value = withTiming(target, { duration: 350 });
      }, flip.at));

      const isLast = i === flips.length - 1;
      if (!isLast || endOnBack) {
        timers.push(setTimeout(() => {
          rotateY.value = withTiming(0, { duration: 350 });
        }, flip.at + 500));
      }
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateY: `${interpolate(rotateY.value, [0, 180 * direction], [0, 180 * direction])}deg` },
    ],
  }));

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateY: `${interpolate(rotateY.value, [0, 180 * direction], [180 * direction, 360 * direction])}deg` },
    ],
  }));

  const cardSize = 110;

  return (
    <View style={{ width: cardSize, height: cardSize }}>
      <Animated.View style={[backStyle, {
        position: "absolute", width: "100%", height: "100%",
        backfaceVisibility: "hidden",
        backgroundColor: colors.p1Bg,
        borderRadius: 12, alignItems: "center", justifyContent: "center",
      }]}>
        <Text style={{ fontSize: 40, fontFamily: "Fredoka_700Bold", color: colors.p1 }}>?</Text>
      </Animated.View>
      <Animated.View style={[frontStyle, {
        position: "absolute", width: "100%", height: "100%",
        backfaceVisibility: "hidden",
        backgroundColor: colors.surfaceContainer,
        borderRadius: 12, alignItems: "center", justifyContent: "center",
      }]}>
        <Text style={{ fontSize: 48 }}>{displayEmoji}</Text>
      </Animated.View>
    </View>
  );
}

/** Wrapper that starts cards together, spreads apart during flip, then stacks */
function HeroCards() {
  const SPREAD_DELAY = 300;  // when cards start spreading apart
  const REJOIN_DELAY = 1800; // when cards come back together
  const STACK_DELAY = 2200;  // when cards stack/overlap

  const leftX = useSharedValue(0);
  const leftY = useSharedValue(0);
  const leftRotate = useSharedValue(0);
  const rightX = useSharedValue(0);
  const rightY = useSharedValue(0);
  const rightRotate = useSharedValue(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Phase 1: Spread apart during flip
    timers.push(setTimeout(() => {
      leftX.value = withSpring(-55, { damping: 14, stiffness: 120 });
      rightX.value = withSpring(55, { damping: 14, stiffness: 120 });
    }, SPREAD_DELAY));

    // Phase 2: Rejoin at center
    timers.push(setTimeout(() => {
      leftX.value = withSpring(0, { damping: 14, stiffness: 120 });
      rightX.value = withSpring(0, { damping: 14, stiffness: 120 });
    }, REJOIN_DELAY));

    // Phase 3: Stack with overlap (existing behavior)
    timers.push(setTimeout(() => {
      leftX.value = withSpring(-30, { damping: 14, stiffness: 120 });
      leftY.value = withSpring(-20, { damping: 14, stiffness: 120 });
      leftRotate.value = withSpring(-12, { damping: 14, stiffness: 120 });
      rightX.value = withSpring(22, { damping: 14, stiffness: 120 });
      rightY.value = withSpring(18, { damping: 14, stiffness: 120 });
      rightRotate.value = withSpring(6, { damping: 14, stiffness: 120 });
    }, STACK_DELAY));

    return () => timers.forEach(clearTimeout);
  }, []);

  const leftStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: leftX.value },
      { translateY: leftY.value },
      { rotate: `${leftRotate.value}deg` },
    ],
    zIndex: 1,
  }));

  const rightStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: rightX.value },
      { translateY: rightY.value },
      { rotate: `${rightRotate.value}deg` },
    ],
    zIndex: 2,
  }));

  return (
    <View style={{ width: 220, height: 160, marginBottom: 28, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={[leftStyle, { position: "absolute" }]}>
        <FlipCard finalEmoji="🐸" delay={200} direction={-1} />
      </Animated.View>
      <Animated.View style={[rightStyle, { position: "absolute" }]}>
        <FlipCard finalEmoji="🧠" delay={400} endOnBack direction={1} />
      </Animated.View>
    </View>
  );
}

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export default function AuthScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const { isOnline, requireOnline } = useConnectivity();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (response.type === "cancelled") {
        setGoogleLoading(false);
        return;
      }
      const idToken = response.data?.idToken;
      if (!idToken) throw new Error("No idToken");
      await db.auth.signInWithIdToken({
        clientName: "google-auth",
        idToken,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/");
    } catch (err: any) {
      setError(err.body?.message ?? err.message ?? t("auth.googleError"));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await db.auth.signInAsGuest();
      router.replace("/auth/setup");
    } finally {
      setGuestLoading(false);
    }
  };

  const tagline = t("auth.tagline");
  const taglineLines = tagline.split("\n");
  const lastLine = taglineLines[taglineLines.length - 1];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Hero — centered */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, paddingTop: 100 }}>
        <Animated.Text
          entering={FadeInDown.delay(100).duration(600)}
          style={{
            fontSize: 52,
            fontFamily: "Fredoka_700Bold",
            color: colors.primaryContainer,
            textAlign: "center",
            marginBottom: 52,
          }}
        >
          Flipia
        </Animated.Text>

        <HeroCards />

        <Animated.Text
          entering={FadeInDown.delay(800).duration(500)}
          style={{
            fontSize: 28, fontFamily: "Fredoka_700Bold", color: colors.onSurface,
            textAlign: "center",
          }}
        >
          {taglineLines.slice(0, -1).join(" · ")} ·{" "}
          <Text style={{ color: colors.primaryContainer }}>{lastLine}</Text>
        </Animated.Text>
      </View>

      {/* Auth buttons — pinned at bottom */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
        <Animated.View entering={FadeIn.duration(300)} style={{ gap: 12 }}>
          {error ? (
            <Animated.View entering={FadeIn.duration(200)} style={{
              backgroundColor: colors.errorBg,
              borderRadius: radii.sm, paddingHorizontal: 12, paddingVertical: 10,
              flexDirection: "row", alignItems: "center", gap: 8,
            }}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={{ color: colors.error, fontSize: 14, fontFamily: "Nunito_400Regular", flex: 1 }}>{error}</Text>
            </Animated.View>
          ) : null}

          <Button
            text={t("auth.continueGoogle")}
            iconNode={<GoogleIcon size={20} />}
            onPress={() => requireOnline(handleGoogle)}
            loading={googleLoading}
            disabled={!isOnline}
            style={{ marginTop: 4 }}
          />

          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginVertical: 6 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.surfaceContainerHigh }} />
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 12, fontFamily: "Nunito_600SemiBold" }}>
              {t("auth.or")}
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.surfaceContainerHigh }} />
          </View>

          <Button
            text={t("auth.continueGuest")}
            icon="👤"
            onPress={() => requireOnline(handleGuest)}
            variant="secondary"
            loading={guestLoading}
            disabled={!isOnline}
          />
        </Animated.View>
      </View>

      {/* Legal footer */}
      <View style={{ paddingHorizontal: 32, paddingBottom: 16, paddingTop: 12 }}>
        <Text style={{
          fontSize: 11, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant,
          textAlign: "center", lineHeight: 16,
        }}>
          {t("auth.legal").replace(/<\/?[a-z]+>/g, "")}
        </Text>
      </View>
    </SafeAreaView>
  );
}
