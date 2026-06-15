// End-of-chapter screen: claim rewards once, then nudge the player to
// train (online or vs AI) to fund the next chapter unlock.
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeContext";
import { Btn3D, Panel, Pop, Ribbon, Rise } from "@/components/ui/arcade";
import { NEXT_CHAPTER_TEASER, useCampaign } from "@/lib/campaign";
import type { StoryChapterDef } from "@/lib/campaign";
import { getAvatarSkin } from "@/lib/skins";
import { track } from "@/lib/analytics";

export function ChapterOutro({ chapter }: { chapter: StoryChapterDef }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { gold, completeChapter } = useCampaign();
  const claimed = useRef(false);

  // Grant rewards exactly once — completeChapter is a no-op when the
  // chapter is already completed, and retries while the profile loads.
  useEffect(() => {
    if (claimed.current) return;
    if (completeChapter(chapter)) {
      claimed.current = true;
      track("campaign_chapter_completed", { chapter: chapter.id });
    }
  }, [chapter, completeChapter]);

  const avatarSkin = getAvatarSkin(chapter.rewardAvatarId);
  const cost = NEXT_CHAPTER_TEASER.unlockCost;
  const missing = Math.max(0, cost - gold);
  const pct = Math.max(5, Math.min(100, (gold / cost) * 100));
  const [goldHue] = colors.hues.gold;

  return (
    <View style={{ gap: 16 }}>
      {/* Rewards */}
      <Rise delay={60}>
        <Panel background={colors.surfaceContainer} style={{ padding: 18, alignItems: "center", gap: 10 }}>
          <Ribbon color="gold">{t("story.rewards.title")}</Ribbon>
          <View style={{ flexDirection: "row", gap: 22, marginTop: 6 }}>
            <Pop delay={250}>
              <View style={{ alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 34 }}>🪙</Text>
                <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 16, color: colors.onSurface }}>
                  +{chapter.rewardGold}
                </Text>
              </View>
            </Pop>
            <Pop delay={450}>
              <View style={{ alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 34 }}>❤️</Text>
                <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 16, color: colors.onSurface }}>
                  +{chapter.rewardLives}
                </Text>
              </View>
            </Pop>
            <Pop delay={650}>
              <View style={{ alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 34 }}>{avatarSkin?.emoji ?? chapter.rewardAvatarId}</Text>
                <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 13, color: colors.onSurface }}>
                  {t("story.rewards.avatar")}
                </Text>
              </View>
            </Pop>
          </View>
        </Panel>
      </Rise>

      {/* Guild training advice — fund the next chapter */}
      <Rise delay={180}>
        <Panel background={colors.surfaceContainer} style={{ padding: 18, gap: 10 }}>
          <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 16, color: colors.onSurface }}>
            🏛️ {t("story.train.title")}
          </Text>
          <Text style={{ fontFamily: "Nunito_600SemiBold", fontSize: 13.5, color: colors.onSurfaceVariant }}>
            {t("story.chapter1.trainHint")}
          </Text>

          {/* Gold progress towards the chapter 2 unlock */}
          <View style={{ gap: 5, marginTop: 4 }}>
            <View
              style={{
                height: 13,
                borderRadius: 999,
                overflow: "hidden",
                backgroundColor: colors.surfaceContainerLow,
              }}
            >
              <View
                style={{ width: `${pct}%`, height: "100%", borderRadius: 999, backgroundColor: goldHue }}
              />
            </View>
            <Text
              style={{
                fontFamily: "Fredoka_700Bold",
                fontSize: 12,
                color: colors.onSurfaceMuted,
                textAlign: "right",
              }}
            >
              {t("story.train.goldProgress", { gold, cost })}
            </Text>
          </View>

          {missing > 0 ? (
            <Text style={{ fontFamily: "Nunito_600SemiBold", fontSize: 13, color: colors.onSurfaceVariant }}>
              {t("story.train.goldMissing", { missing })}
            </Text>
          ) : (
            <Ribbon color="violet" style={{ alignSelf: "center" }}>
              {t("story.campaign.soon")}
            </Ribbon>
          )}

          <View style={{ gap: 10, marginTop: 6 }}>
            <Btn3D
              color="coral"
              size="md"
              full
              label={t("story.train.online")}
              onPress={() => router.push("/mode/casual")}
            >
              <Text style={{ fontSize: 16 }}>🌐</Text>
            </Btn3D>
            <Btn3D
              color="blue"
              size="md"
              full
              label={t("story.train.vsAi")}
              onPress={() => router.push("/mode/solo")}
            >
              <Text style={{ fontSize: 16 }}>🤖</Text>
            </Btn3D>
          </View>
        </Panel>
      </Rise>
    </View>
  );
}
