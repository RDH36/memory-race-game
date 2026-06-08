import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import { useConnectivity } from "@/lib/ConnectivityContext";
import type { HueName } from "@/components/ui/theme";
import { Panel, SectionTitle } from "@/components/ui/arcade";

type Mode = {
  key: string;
  icon: string;
  title: string;
  sub: string;
  color: HueName;
  route: "/mode/solo" | "/room/create" | "/room/matchmaking";
  /** Online routes are gated behind a connectivity check. */
  online?: boolean;
};

export function QuickModes() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { requireOnline } = useConnectivity();

  const modes: Mode[] = [
    { key: "duel", icon: "⚔️", title: t("home.duel"), sub: t("home.duelDesc"), color: "coral", route: "/room/create", online: true },
    { key: "solo", icon: "🧠", title: t("home.soloShort"), sub: t("home.soloShortDesc"), color: "blue", route: "/mode/solo" },
    { key: "quick", icon: "⚡", title: t("home.quickShort"), sub: t("home.quickShortDesc"), color: "green", route: "/room/matchmaking", online: true },
  ];

  const go = (m: Mode) => {
    if (m.online) {
      requireOnline(() => router.push(m.route));
    } else {
      router.push(m.route);
    }
  };

  return (
    <View style={{ marginBottom: 22 }}>
      <SectionTitle>{t("home.quickModes")}</SectionTitle>
      <View style={{ flexDirection: "row", gap: 11 }}>
        {modes.map((m) => {
          const [c, cd] = colors.hues[m.color];
          return (
            <View key={m.key} style={{ flex: 1 }}>
              <Panel
                onPress={() => go(m)}
                style={{ paddingTop: 14, paddingBottom: 13, paddingHorizontal: 8, alignItems: "center" }}
                radius={18}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: c,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 8,
                    boxShadow: `0 3px 0 ${cd}`,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{m.icon}</Text>
                </View>
                <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 14, color: colors.onSurface }}>
                  {m.title}
                </Text>
                <Text
                  style={{ fontFamily: "Fredoka_700Bold", fontSize: 10, color: colors.onSurfaceMuted }}
                >
                  {m.sub}
                </Text>
              </Panel>
            </View>
          );
        })}
      </View>
    </View>
  );
}
