import { Pressable, View } from "react-native";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../lib/ThemeContext";
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
}: {
  onPress: () => void;
  color: string;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={() => {
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
            borderRadius: 28,
            backgroundColor: color,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Ionicons name="game-controller" size={26} color="#FFFFFF" />
      </Animated.View>
    </Pressable>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      detachInactiveScreens
      screenOptions={{
        headerShown: false,
        animation: "shift",
        freezeOnBlur: true,
        sceneStyle: { backgroundColor: colors.surface },
        tabBarActiveTintColor: colors.primaryContainer,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarButton: (props) => <TabBarButton {...props} />,
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
      }}
    >
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: t("tabs.leaderboard"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="trophy" size={22} color={color} />
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
            />
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
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
