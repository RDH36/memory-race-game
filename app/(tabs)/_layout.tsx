import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Tabs } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../lib/ThemeContext";
import { haptics } from "../../lib/haptics";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

function TabBarButton({
  children,
  onPress,
  onLongPress,
  accessibilityState,
}: any) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={(e) => {
        haptics.select();
        scale.value = withSpring(0.85, { damping: 10, stiffness: 400 });
        setTimeout(() => {
          scale.value = withSpring(1, { damping: 8, stiffness: 300 });
        }, 80);
        onPress?.(e);
      }}
      onLongPress={onLongPress}
      accessibilityState={accessibilityState}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 6,
      }}
    >
      <Animated.View style={[style, { alignItems: "center" }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

function PlayButton({
  onPress,
  color,
  lip,
}: {
  onPress: () => void;
  color: string;
  lip: string;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={() => {
        haptics.press();
        scale.value = withSpring(0.85, { damping: 10, stiffness: 400 });
        setTimeout(() => {
          scale.value = withSpring(1, { damping: 8, stiffness: 300 });
        }, 80);
        onPress();
      }}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 2,
      }}
    >
      <Animated.View
        style={[
          style,
          {
            position: "absolute",
            bottom: 8,
            width: 56,
            height: 56,
            borderRadius: 20,
            backgroundColor: color,
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 5px 0 ${lip}, 0 12px 20px -6px ${color}99`,
          },
        ]}
      >
        {/* gloss */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 9,
            right: 9,
            top: 6,
            height: 16,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.3)",
          }}
        />
        <Ionicons name="game-controller" size={26} color="#FFFFFF" />
      </Animated.View>
    </Pressable>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // "NEW" badge on the Builds tab until the player opens it once.
  const [buildsSeen, setBuildsSeen] = useState(true);
  useEffect(() => {
    AsyncStorage.getItem("builds_seen").then((v) => setBuildsSeen(v === "true"));
  }, []);
  const markBuildsSeen = () => {
    if (buildsSeen) return;
    setBuildsSeen(true);
    AsyncStorage.setItem("builds_seen", "true");
  };

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      animation: "shift" as const,
      freezeOnBlur: true,
      sceneStyle: { backgroundColor: colors.surface },
      tabBarActiveTintColor: colors.primaryContainer,
      tabBarInactiveTintColor: colors.onSurfaceVariant,
      tabBarButton: (props: any) => <TabBarButton {...props} />,
      tabBarHideOnKeyboard: true,
      tabBarStyle: {
        backgroundColor: colors.surfaceContainer,
        borderTopWidth: 0,
        height: 56 + insets.bottom,
        paddingBottom: insets.bottom,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontFamily: "Nunito_600SemiBold",
      },
    }),
    [
      colors.surface,
      colors.primaryContainer,
      colors.onSurfaceVariant,
      colors.surfaceContainer,
      insets.bottom,
    ],
  );

  return (
    <Tabs detachInactiveScreens screenOptions={screenOptions}>
      <Tabs.Screen
        name="builds"
        listeners={{ focus: markBuildsSeen }}
        options={{
          title: t("tabs.builds", "Builds"),
          tabBarIcon: ({ color }) => (
            <View>
              <Ionicons name="flash" size={22} color={color} />
              {!buildsSeen && (
                <View
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -9,
                    minWidth: 16,
                    height: 16,
                    paddingHorizontal: 3,
                    borderRadius: 8,
                    backgroundColor: colors.hues.coral[0],
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 1px 0 ${colors.hues.coral[1]}`,
                  }}
                >
                  <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 8, color: "#fff" }}>NEW</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: t("tabs.achievements", "Succès"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="medal" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarButton: (props) => (
            <PlayButton
              onPress={() => props.onPress?.({} as any)}
              color={colors.primaryContainer}
              lip={colors.hues.violet[1]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: t("tabs.shop", "Boutique"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="bag-handle" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={22} color={color} />
          ),
        }}
      />
      {/* Hidden routes — reachable via router.push only. Leaderboard is
          linked from the Home screen (HomeStats). */}
      <Tabs.Screen name="leaderboard" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
