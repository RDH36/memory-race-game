import { useEffect, type ReactNode } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated, {
  Easing,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/lib/ThemeContext";
import { Bubble, Mascot } from "@/components/ui/arcade";

function Bob({ children, delay = 0, amount = 6 }: { children: ReactNode; delay?: number; amount?: number }) {
  const v = useSharedValue(0);

  useEffect(() => {
    v.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-amount, { duration: 1700, easing: Easing.inOut(Easing.ease) }),
          withTiming(amount, { duration: 1700, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: v.value }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

/** Springy staggered entrance — same choreography family as the original
 *  auth hero (pop + slide-in with overshoot). */
function SpringIn({
  children,
  delay = 0,
  fromX = 0,
  fromY = 0,
}: {
  children: ReactNode;
  delay?: number;
  fromX?: number;
  fromY?: number;
}) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withDelay(delay, withSpring(1, { damping: 9, stiffness: 170 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: Math.min(p.value * 2, 1),
    transform: [
      { translateX: fromX * (1 - p.value) },
      { translateY: fromY * (1 - p.value) },
      { scale: p.value },
    ],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

/** The heroes' register: the signature flip card — "?" turning into the
 *  scroll, looping like the welcome screen's memory card. */
function RegisterCard() {
  const { colors } = useTheme();
  const rotateY = useSharedValue(0);

  useEffect(() => {
    rotateY.value = withRepeat(
      withSequence(
        withDelay(2200, withTiming(180, { duration: 600, easing: Easing.inOut(Easing.ease) })),
        withDelay(2200, withTiming(360, { duration: 600, easing: Easing.inOut(Easing.ease) })),
      ),
      -1,
      false,
    );
  }, []);

  const face = {
    position: "absolute" as const,
    width: 54,
    height: 68,
    borderRadius: 12,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backfaceVisibility: "hidden" as const,
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateY: `${rotateY.value}deg` }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateY: `${rotateY.value + 180}deg` }],
  }));

  return (
    <View style={{ width: 54, height: 68, transform: [{ rotate: "-6deg" }] }}>
      <Animated.View
        style={[
          face,
          frontStyle,
          {
            backgroundColor: colors.hues.violet[0],
            boxShadow: `0 4px 0 ${colors.hues.violet[1]}, 0 10px 18px -10px ${colors.panelShadow}`,
          },
        ]}
      >
        <Text style={{ fontSize: 22, fontFamily: "Fredoka_700Bold", color: "#fff" }}>?</Text>
      </Animated.View>
      <Animated.View
        style={[
          face,
          backStyle,
          {
            backgroundColor: colors.surfaceContainer,
            boxShadow: `0 4px 0 ${colors.panelLip}, 0 10px 18px -10px ${colors.panelShadow}`,
          },
        ]}
      >
        <Text style={{ fontSize: 26 }}>📜</Text>
      </Animated.View>
    </View>
  );
}

/** The village Memory Guild: the hall pops in, the Lion guard and a
 *  villager spring in from the sides, then the register card flips. */
export function GuildHero() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ width: 260, height: 218 }}>
      {/* Soft gold halo behind the hall */}
      <Animated.View
        entering={FadeIn.delay(200).duration(700)}
        style={{
          position: "absolute",
          top: 28,
          alignSelf: "center",
          width: 150,
          height: 150,
          borderRadius: 75,
          backgroundColor: colors.hues.gold[2],
        }}
      />

      {/* Guild hall pops in first */}
      <View style={{ position: "absolute", bottom: 24, alignSelf: "center" }}>
        <SpringIn delay={250}>
          <Bob amount={5}>
            <Mascot emoji="🏛️" size={96} />
          </Bob>
        </SpringIn>
      </View>

      {/* The Lion guard springs in from the left */}
      <View style={{ position: "absolute", bottom: 4, left: 18 }}>
        <SpringIn delay={550} fromX={-80}>
          <Bob delay={550} amount={4}>
            <Mascot emoji="🦁" size={58} />
          </Bob>
        </SpringIn>
      </View>

      {/* A villager springs in from the right */}
      <View style={{ position: "absolute", bottom: 6, right: 26 }}>
        <SpringIn delay={750} fromX={80}>
          <Bob delay={750} amount={4}>
            <Mascot emoji="😊" size={44} />
          </Bob>
        </SpringIn>
      </View>

      {/* The register card flips at the hall's doorstep */}
      <View style={{ position: "absolute", bottom: 0, alignSelf: "center", marginLeft: 52 }}>
        <SpringIn delay={950} fromY={40}>
          <RegisterCard />
        </SpringIn>
      </View>

      {/* Lion's welcome */}
      <View style={{ position: "absolute", top: 4, left: 0 }}>
        <SpringIn delay={1250}>
          <Bubble>{t("auth.guildWelcome")}</Bubble>
        </SpringIn>
      </View>
    </View>
  );
}
