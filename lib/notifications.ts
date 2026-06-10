import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18next from "../i18n";
import { localDayIndex } from "./dailyStreak";
import { weekIndex } from "./questPeriods";

const REMINDER_HOUR = 18;
const REMINDER_MINUTE = 0;
// Quest reminders fire at 7am — daily every day, weekly every Friday.
const QUEST_HOUR = 7;
const QUEST_MINUTE = 0;
const FRIDAY = 5; // JS Date.getDay(): 0 = Sunday … 5 = Friday
const PERMISSION_KEY = "notif_perm_asked";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannels() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("daily-reward", {
    name: "Daily Reward",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200, 100, 200],
    lightColor: "#534AB7",
  });
  await Notifications.setNotificationChannelAsync("quests", {
    name: "Quests",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200, 100, 200],
    lightColor: "#534AB7",
  });
}

async function hasPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  return (
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

/** Next occurrence of hour:minute local (today if still ahead, else tomorrow). */
function nextDailyFire(now = new Date()): Date {
  const d = new Date(now);
  d.setHours(QUEST_HOUR, QUEST_MINUTE, 0, 0);
  if (d <= now) d.setDate(d.getDate() + 1);
  return d;
}

/** Next occurrence of `weekday` at hour:minute local. */
function nextWeekdayFire(weekday: number, now = new Date()): Date {
  const d = new Date(now);
  d.setHours(QUEST_HOUR, QUEST_MINUTE, 0, 0);
  let add = (weekday - d.getDay() + 7) % 7;
  if (add === 0 && d <= now) add = 7;
  d.setDate(d.getDate() + add);
  return d;
}

// --- Daily reward reminder (18h, recurring, unconditional) ----------------

export async function setupDailyReminder() {
  try {
    await ensureAndroidChannels();

    let granted = await hasPermission();
    const settings = await Notifications.getPermissionsAsync();
    if (!granted && settings.canAskAgain !== false) {
      const req = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: false, allowSound: true },
      });
      granted = req.granted;
      await AsyncStorage.setItem(PERMISSION_KEY, "1");
    }
    if (!granted) return;

    const pending = await Notifications.getAllScheduledNotificationsAsync();
    if (pending.some((n) => n.identifier === "daily-reward")) return;

    await Notifications.scheduleNotificationAsync({
      identifier: "daily-reward",
      content: {
        title: i18next.t("notifications.dailyRewardTitle"),
        body: i18next.t("notifications.dailyRewardBody"),
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: REMINDER_HOUR,
        minute: REMINDER_MINUTE,
        channelId: "daily-reward",
      },
    });
  } catch {
    // Notifications not available (web, emulator without Google Play, etc.) — ignore
  }
}

// --- Quest reminders (7am, conditional, re-scheduled on app open) ----------

/**
 * Schedules a one-shot daily (7am) and weekly (Friday 7am) quest reminder,
 * but only when unclaimed quests will still be waiting at fire time. Called
 * on every app foreground so the schedule reflects the latest progress.
 */
export async function refreshQuestReminders({
  dailyAllDone,
  weeklyAllDone,
}: {
  dailyAllDone: boolean;
  weeklyAllDone: boolean;
}) {
  try {
    if (!(await hasPermission())) return;
    await ensureAndroidChannels();

    const now = new Date();

    // Daily — a fire that lands tomorrow always has fresh (reset) quests.
    await Notifications.cancelScheduledNotificationAsync("quest-daily");
    const dFire = nextDailyFire(now);
    const dFireIsToday = dFire.getDate() === now.getDate();
    if (!(dFireIsToday && dailyAllDone)) {
      await Notifications.scheduleNotificationAsync({
        identifier: "quest-daily",
        content: {
          title: i18next.t("notifications.questDailyTitle"),
          body: i18next.t("notifications.questDailyBody"),
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: dFire,
          channelId: "quests",
        },
      });
    }

    // Weekly — a fire in a future week always has fresh (reset) quests.
    await Notifications.cancelScheduledNotificationAsync("quest-weekly");
    const wFire = nextWeekdayFire(FRIDAY, now);
    const wSameWeek =
      weekIndex(localDayIndex(wFire.getTime())) === weekIndex(localDayIndex(now.getTime()));
    if (!(wSameWeek && weeklyAllDone)) {
      await Notifications.scheduleNotificationAsync({
        identifier: "quest-weekly",
        content: {
          title: i18next.t("notifications.questWeeklyTitle"),
          body: i18next.t("notifications.questWeeklyBody"),
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: wFire,
          channelId: "quests",
        },
      });
    }
  } catch {
    // Notifications not available — ignore
  }
}

export async function cancelDailyReminder() {
  try {
    await Notifications.cancelScheduledNotificationAsync("daily-reward");
    await Notifications.cancelScheduledNotificationAsync("quest-daily");
    await Notifications.cancelScheduledNotificationAsync("quest-weekly");
  } catch {
    // no-op
  }
}
