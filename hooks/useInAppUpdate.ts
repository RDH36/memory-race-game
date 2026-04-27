import Constants from "expo-constants";
import { useCallback, useEffect, useRef, useState } from "react";
import { Linking, Platform } from "react-native";

import {
  compareVersions,
  fetchAppStoreVersion,
  getCurrentAppVersion,
  markDismissedToday,
  wasDismissedToday,
} from "@/lib/inAppUpdate";

export type UpdateStatus =
  | { kind: "idle" }
  | { kind: "available"; storeVersion?: string; storeUrl?: string }
  | { kind: "downloading"; progress?: number }
  | { kind: "readyToInstall" }
  | { kind: "error" };

export type UseInAppUpdate = {
  status: UpdateStatus;
  confirm: () => void;
  dismiss: () => void;
  installNow: () => void;
};

const ANDROID_DOWNLOADED_STATUS = 11;
const ANDROID_DOWNLOADING_STATUS = 2;

function loadAndroidLib(): {
  SpInAppUpdates: any;
  IAUUpdateKind: any;
} | null {
  if (Platform.OS !== "android") return null;
  try {
    const lib = require("sp-react-native-in-app-updates");
    return {
      SpInAppUpdates: lib.default,
      IAUUpdateKind: lib.IAUUpdateKind,
    };
  } catch {
    return null;
  }
}

function getBundleId(): string | null {
  const cfg = Constants.expoConfig;
  if (Platform.OS === "ios") return cfg?.ios?.bundleIdentifier ?? null;
  return cfg?.android?.package ?? null;
}

export function useInAppUpdate(): UseInAppUpdate {
  const [status, setStatus] = useState<UpdateStatus>({ kind: "idle" });
  const androidInstanceRef = useRef<any>(null);
  const androidStatusListenerRef = useRef<((s: any) => void) | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initial check on mount
  useEffect(() => {
    if (__DEV__) return;

    let cancelled = false;

    (async () => {
      const dismissed = await wasDismissedToday();
      if (dismissed || cancelled) return;

      const bundleId = getBundleId();
      if (!bundleId) return;

      if (Platform.OS === "android") {
        await checkAndroid(bundleId);
      } else if (Platform.OS === "ios") {
        await checkIos(bundleId);
      }
    })();

    return () => {
      cancelled = true;
      const inst = androidInstanceRef.current;
      const listener = androidStatusListenerRef.current;
      if (inst && listener) {
        try {
          inst.removeStatusUpdateListener(listener);
        } catch {
          // ignore
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAndroid = useCallback(async (_bundleId: string) => {
    const lib = loadAndroidLib();
    if (!lib?.SpInAppUpdates) return;

    try {
      const inst = new lib.SpInAppUpdates(false);
      androidInstanceRef.current = inst;

      const listener = (event: { status: number }) => {
        if (!isMountedRef.current) return;
        if (event.status === ANDROID_DOWNLOADING_STATUS) {
          setStatus({ kind: "downloading" });
        } else if (event.status === ANDROID_DOWNLOADED_STATUS) {
          setStatus({ kind: "readyToInstall" });
        }
      };
      inst.addStatusUpdateListener(listener);
      androidStatusListenerRef.current = listener;

      const res = await inst.checkNeedsUpdate({
        curVersion: getCurrentAppVersion(),
      });
      if (!isMountedRef.current) return;

      if (res?.shouldUpdate) {
        setStatus({
          kind: "available",
          storeVersion: res.storeVersion,
        });
      }
    } catch {
      // module unavailable or check failed — stay idle
    }
  }, []);

  const checkIos = useCallback(async (bundleId: string) => {
    const info = await fetchAppStoreVersion(bundleId);
    if (!info || !isMountedRef.current) return;

    const cmp = compareVersions(info.version, getCurrentAppVersion());
    if (cmp > 0) {
      setStatus({
        kind: "available",
        storeVersion: info.version,
        storeUrl: info.trackViewUrl,
      });
    }
  }, []);

  const confirm = useCallback(() => {
    if (Platform.OS === "android") {
      const inst = androidInstanceRef.current;
      const lib = loadAndroidLib();
      if (!inst || !lib?.IAUUpdateKind) return;
      inst
        .startUpdate({ updateType: lib.IAUUpdateKind.FLEXIBLE })
        .catch(() => {
          if (isMountedRef.current) setStatus({ kind: "error" });
        });
      return;
    }

    if (Platform.OS === "ios") {
      const current = status;
      if (current.kind === "available" && current.storeUrl) {
        Linking.openURL(current.storeUrl).catch(() => {
          // ignore
        });
        setStatus({ kind: "idle" });
      }
    }
  }, [status]);

  const dismiss = useCallback(() => {
    setStatus({ kind: "idle" });
    void markDismissedToday();
  }, []);

  const installNow = useCallback(() => {
    if (Platform.OS !== "android") return;
    const inst = androidInstanceRef.current;
    if (!inst) return;
    try {
      inst.installUpdate();
    } catch {
      if (isMountedRef.current) setStatus({ kind: "error" });
    }
  }, []);

  return { status, confirm, dismiss, installNow };
}
