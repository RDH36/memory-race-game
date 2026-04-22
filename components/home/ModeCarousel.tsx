import { useRef, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { useTheme } from "../../lib/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_GAP = 14;
const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

export interface ModeItem {
  key: string;
  icon: string;
  title: string;
  desc: string;
  badge: string;
  badgeColor: string;
  accentColor: string;
  disabled?: boolean;
  onPress: () => void;
}

interface ModeCarouselProps {
  items: ModeItem[];
}

function CarouselCard({
  item,
  index,
  scrollX,
}: {
  item: ModeItem;
  index: number;
  scrollX: SharedValue<number>;
}) {
  const { colors, isDark } = useTheme();
  const pressScale = useSharedValue(1);

  const inputRange = [
    (index - 1) * SNAP_INTERVAL,
    index * SNAP_INTERVAL,
    (index + 1) * SNAP_INTERVAL,
  ];

  const animStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollX.value, inputRange, [0.9, 1, 0.9], "clamp");
    const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], "clamp");
    const translateY = interpolate(scrollX.value, inputRange, [8, 0, 8], "clamp");

    return {
      transform: [
        { scale: scale * pressScale.value },
        { translateY },
      ],
      opacity: item.disabled ? Math.min(opacity, 0.45) : opacity,
    };
  });

  return (
    <Animated.View style={[{ width: CARD_WIDTH }, animStyle]}>
      <Pressable
        onPressIn={() => { pressScale.value = withSpring(0.97, { damping: 15, stiffness: 200 }); }}
        onPressOut={() => { pressScale.value = withSpring(1, { damping: 15, stiffness: 200 }); }}
        onPress={() => {
          if (item.disabled) return;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          item.onPress();
        }}
        disabled={item.disabled}
      >
        <View
          style={{
            backgroundColor: isDark ? colors.surfaceContainerHigh : colors.surfaceContainer,
            borderRadius: 22,
            overflow: "hidden",
          }}
        >
          {/* Colored header band */}
          <View
            style={{
              backgroundColor: item.accentColor + "12",
              paddingTop: 24,
              paddingBottom: 20,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 68,
                height: 68,
                borderRadius: 34,
                backgroundColor: item.accentColor + "1A",
                borderWidth: 2,
                borderColor: item.accentColor + "30",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 34 }}>{item.icon}</Text>
            </View>
          </View>

          {/* Content */}
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Fredoka_700Bold",
                  color: colors.onSurface,
                }}
              >
                {item.title}
              </Text>
              {item.disabled ? (
                <View
                  style={{
                    backgroundColor: colors.onSurfaceVariant,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ fontSize: 9, fontFamily: "Nunito_700Bold", color: "#fff", letterSpacing: 0.4 }}>
                    SOON
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: item.accentColor,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 16, color: "#FFF", fontFamily: "Fredoka_700Bold" }}>{">"}</Text>
                </View>
              )}
            </View>

            <Text
              style={{
                fontSize: 13,
                fontFamily: "Nunito_400Regular",
                color: colors.onSurfaceVariant,
                marginTop: 6,
                lineHeight: 18,
              }}
              numberOfLines={2}
            >
              {item.desc}
            </Text>

            {/* Badge */}
            <View
              style={{
                backgroundColor: item.badgeColor + "14",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 6,
                alignSelf: "flex-start",
                marginTop: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Nunito_700Bold",
                  color: item.badgeColor,
                  letterSpacing: 0.5,
                }}
              >
                {item.badge}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const AnimatedScrollView = Animated.createAnimatedComponent(
  require("react-native").ScrollView as typeof import("react-native").ScrollView,
);

export function ModeCarousel({ items }: ModeCarouselProps) {
  const { isDark } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => { scrollX.value = e.contentOffset.x; },
  });

  const onMomentumEnd = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
    setActiveIndex(Math.max(0, Math.min(idx, items.length - 1)));
  };

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <AnimatedScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        contentContainerStyle={{
          paddingLeft: SIDE_PADDING,
          paddingRight: SIDE_PADDING,
          gap: CARD_GAP,
          paddingVertical: 10,
        }}
        onScroll={scrollHandler}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
      >
        {items.map((item, index) => (
          <CarouselCard key={item.key} item={item} index={index} scrollX={scrollX} />
        ))}
      </AnimatedScrollView>

      {/* Dots */}
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 6 }}>
        {items.map((item, i) => (
          <View
            key={item.key}
            style={{
              width: i === activeIndex ? 20 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === activeIndex
                ? items[activeIndex].accentColor
                : (isDark ? "#444" : "#D8D4D4"),
            }}
          />
        ))}
      </View>
    </Animated.View>
  );
}
