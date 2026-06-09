import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import type { AbilityState } from "@/lib/abilities";

/** A tinted card with an icon title + a paragraph (story / timing). */
export function InfoSection({ icon, label, text, hue }: { icon: string; label: string; text: string; hue: AbilityState["hue"] }) {
  const { colors } = useTheme();
  const [base, lip, tint] = colors.hues[hue];
  return (
    <View
      style={{
        width: "100%",
        marginTop: 12,
        backgroundColor: tint,
        borderRadius: 18,
        padding: 14,
        boxShadow: `0 3px 0 ${lip}22`,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 6 }}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
        <Text
          style={{
            fontSize: 12,
            fontFamily: "Fredoka_700Bold",
            letterSpacing: 0.6,
            color: base,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Text>
      </View>
      <Text style={{ fontSize: 13.5, lineHeight: 20, fontFamily: "Nunito_700Bold", color: colors.onSurface }}>
        {text}
      </Text>
    </View>
  );
}

/** Lists each level's effect, highlighting the player's current level. */
export function LevelsSection({ ability }: { ability: AbilityState }) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [base, lip, tint] = colors.hues[ability.hue];
  const levels = Array.from({ length: ability.maxLevel }, (_, i) => i + 1);

  return (
    <View
      style={{
        width: "100%",
        marginTop: 12,
        backgroundColor: tint,
        borderRadius: 18,
        padding: 14,
        boxShadow: `0 3px 0 ${lip}22`,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 8 }}>
        <Text style={{ fontSize: 16 }}>🎚️</Text>
        <Text style={{ fontSize: 12, fontFamily: "Fredoka_700Bold", letterSpacing: 0.6, color: base, textTransform: "uppercase" }}>
          {t("builds.levels")}
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        {levels.map((n) => {
          const reached = ability.level >= n;
          const isCurrent = ability.level === n;
          return (
            <View key={n} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: reached ? base : colors.surfaceContainer,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 1,
                }}
              >
                <Text style={{ fontSize: 12, fontFamily: "Fredoka_700Bold", color: reached ? "#fff" : colors.onSurfaceMuted }}>
                  {n}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, lineHeight: 18, fontFamily: "Nunito_700Bold", color: colors.onSurface }}>
                  {t(`abilities.${ability.nameKey}.levels.${n}`)}
                </Text>
                {isCurrent && (
                  <Text style={{ fontSize: 10.5, fontFamily: "Fredoka_700Bold", color: base, marginTop: 1 }}>
                    • {t("builds.currentLevel")}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
