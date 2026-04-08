import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Card } from "../ui/Card";
import { useTheme } from "../../lib/ThemeContext";
import type { MatchEntry } from "../../lib/matchHistory";

const DIFFICULTY_ICON: Record<string, string> = {
  easy: "🐣",
  medium: "🦊",
  hard: "🤖",
};

function formatDate(ts: number, locale: string): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const time = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return time;
  if (isYesterday) return `${locale.startsWith("fr") ? "Hier" : "Yesterday"} · ${time}`;
  return d.toLocaleDateString(locale, { day: "2-digit", month: "short" });
}

function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m${s.toString().padStart(2, "0")}` : `${s}s`;
}

export function MatchRow({ match }: { match: MatchEntry }) {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();

  const icon = match.player2Type === "cpu" ? DIFFICULTY_ICON[match.difficulty] ?? "🎮" : "👥";
  const modeLabel =
    match.player2Type === "cpu"
      ? t(`history.vsAi${match.difficulty.charAt(0).toUpperCase() + match.difficulty.slice(1)}`)
      : t("history.vsHuman");

  const resultBg = match.won
    ? isDark ? "#1F3A2A" : "#E8F5E9"
    : isDark ? "#3A1F1F" : "#FDECEA";
  const resultColor = match.won
    ? isDark ? "#6BCF8A" : "#2E7D32"
    : isDark ? "#E57373" : "#C62828";

  return (
    <Card
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
      }}
    >
      <Text style={{ fontSize: 28 }}>{icon}</Text>

      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 15, fontFamily: "Fredoka_600SemiBold", color: colors.onSurface }}>
          {modeLabel}
        </Text>
        <Text style={{ fontSize: 12, fontFamily: "Nunito_400Regular", color: colors.onSurfaceVariant }}>
          {formatDate(match.createdAt, i18n.language)} · {formatDuration(match.duration)}
        </Text>
      </View>

      <View style={{ alignItems: "flex-end", gap: 4 }}>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 3,
            borderRadius: 8,
            backgroundColor: resultBg,
          }}
        >
          <Text style={{ fontSize: 11, fontFamily: "Nunito_700Bold", color: resultColor, letterSpacing: 0.5 }}>
            {match.won ? t("history.win") : t("history.loss")}
          </Text>
        </View>
        <Text style={{ fontSize: 13, fontFamily: "Fredoka_600SemiBold", color: colors.onSurface }}>
          {match.scoreP1} - {match.scoreP2}
        </Text>
      </View>
    </Card>
  );
}
