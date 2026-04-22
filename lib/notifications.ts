import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18next from "../i18n";

const REMINDER_HOUR = 18;
const REMINDER_MINUTE = 0;
const PERMISSION_KEY = "notif_perm_asked";
const SCHEDULED_KEY = "notif_daily_scheduled";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("daily-reward", {
    name: "Daily Reward",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200, 100, 200],
    lightColor: "#534AB7",
  });
}

export async function setupDailyReminder() {
  try {
    await ensureAndroidChannel();

    const settings = await Notifications.getPermissionsAsync();
    let granted =
      settings.granted ||
      settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

    if (!granted && settings.canAskAgain !== false) {
      const req = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: false, allowSound: true },
      });
      granted = req.granted;
      await AsyncStorage.setItem(PERMISSION_KEY, "1");
    }

    if (!granted) return;

    const alreadyScheduled = await AsyncStorage.getItem(SCHEDULED_KEY);
    if (alreadyScheduled === "1") {
      const pending = await Notifications.getAllScheduledNotificationsAsync();
      if (pending.some((n) => n.identifier === "daily-reward")) return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

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
      },
    });

    await AsyncStorage.setItem(SCHEDULED_KEY, "1");
  } catch {
    // Notifications not available (web, emulator without Google Play, etc.) — ignore
  }
}

export async function cancelDailyReminder() {
  try {
    await Notifications.cancelScheduledNotificationAsync("daily-reward");
    await AsyncStorage.removeItem(SCHEDULED_KEY);
  } catch {
    // no-op
  }
}
