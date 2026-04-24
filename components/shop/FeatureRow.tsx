import { Text, View } from "react-native";
import { useTheme } from "../../lib/ThemeContext";

/**
 * Display shape for a feature row — title/description hydrated from i18n
 * by the parent. The visual is derived from `kind` + visualData.
 */
export type FeatureDisplay =
  | { kind: "avatar"; emoji: string; title: string; description: string }
  | { kind: "table"; bg: string; accent: string; title: string; description: string }
  | { kind: "perk"; icon: string; title: string; description: string };

export function FeatureRow({ feature }: { feature: FeatureDisplay }) {
  const { colors } = useTheme();

  let visual: React.ReactNode;
  if (feature.kind === "avatar") {
    visual = (
      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primaryContainerBg, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 30 }}>{feature.emoji}</Text>
      </View>
    );
  } else if (feature.kind === "table") {
    visual = (
      <View
        style={{
          width: 56, height: 56, borderRadius: 14,
          backgroundColor: feature.bg,
          alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: feature.accent }} />
      </View>
    );
  } else {
    visual = (
      <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: colors.primaryContainerBg, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 26 }}>{feature.icon}</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 14,
      }}
    >
      {visual}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontFamily: "Fredoka_700Bold", color: colors.onSurface }}>
          {feature.title}
        </Text>
        <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant, marginTop: 2 }}>
          {feature.description}
        </Text>
      </View>
    </View>
  );
}
