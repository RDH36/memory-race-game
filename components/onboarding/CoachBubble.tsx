import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import type { HueName } from "@/components/ui/theme";
import { HandPointer } from "./HandPointer";

/** One-time gate persisted in AsyncStorage. */
export function useCoachMark(key: string) {
  const [seen, setSeen] = useState<boolean | null>(null);
  useEffect(() => {
    AsyncStorage.getItem(key).then((v) => setSeen(v === "true"));
  }, [key]);
  return {
    show: seen === false,
    dismiss: () => {
      setSeen(true);
      AsyncStorage.setItem(key, "true");
    },
  };
}

/**
 * Coach-mark anchored directly to the component it describes — render it as an
 * absolute sibling INSIDE the target's wrapper. `side` decides whether the
 * bubble sits above or below the target; the finger points at it. No
 * measurement → it's always perfectly aligned with the component.
 *
 *   <View>                       // wrapper (relative by default in RN)
 *     <Target />
 *     {coach.show && <CoachBubble side="above" .../>}
 *   </View>
 */
export function CoachBubble({
  text,
  onDismiss,
  side = "above",
  hue = "violet",
}: {
  text: string;
  onDismiss: () => void;
  side?: "above" | "below";
  hue?: HueName;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [base, lip] = colors.hues[hue];

  const anchor =
    side === "above"
      ? { bottom: "100%" as const, marginBottom: 4 }
      : { top: "100%" as const, marginTop: 4 };

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      style={{ position: "absolute", left: 0, right: 0, alignItems: "center", zIndex: 50, ...anchor }}
    >
      {side === "below" && <HandPointer pointing="up" size={30} style={{ marginBottom: 24 }} />}
      <Pressable
        onPress={onDismiss}
        style={{
          maxWidth: 300,
          backgroundColor: base,
          borderRadius: 18,
          paddingVertical: 12,
          paddingHorizontal: 16,
          boxShadow: `0 4px 0 ${lip}, 0 16px 28px -10px #00000055`,
        }}
      >
        <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 14.5, color: "#fff", textAlign: "center" }}>{text}</Text>
        <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 11, color: "rgba(255,255,255,0.85)", textAlign: "center", marginTop: 4 }}>
          {t("onboarding.coach.tap")}
        </Text>
      </Pressable>
      {side === "above" && <HandPointer pointing="down" size={30} style={{ marginTop: 24 }} />}
    </Animated.View>
  );
}
