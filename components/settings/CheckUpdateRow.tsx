import { useState } from "react";
import { ActivityIndicator, Linking, Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/ThemeContext";
import { ConfirmModal } from "../ui/ConfirmModal";
import {
  checkForUpdate,
  getCurrentAppVersion,
  type UpdateCheckResult,
} from "../../lib/inAppUpdate";

export function CheckUpdateRow() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UpdateCheckResult | null>(null);
  const currentVersion = getCurrentAppVersion();

  const handleCheck = async () => {
    if (loading) return;
    Haptics.selectionAsync();
    setLoading(true);
    const r = await checkForUpdate();
    setLoading(false);
    setResult(r);
  };

  const closeResult = () => setResult(null);

  const handleConfirm = () => {
    if (result?.kind === "available" && result.storeUrl) {
      Linking.openURL(result.storeUrl).catch(() => {});
    }
    setResult(null);
  };

  const modalConfig = (() => {
    if (!result) return null;
    if (result.kind === "available") {
      return {
        icon: "🎉",
        title: t("settings.update.availableTitle"),
        message: t("settings.update.availableBody", { version: result.storeVersion }),
        cancelText: t("settings.update.later"),
        confirmText: t("settings.update.updateCta"),
      };
    }
    if (result.kind === "upToDate") {
      return {
        icon: "✅",
        title: t("settings.update.upToDateTitle"),
        message: t("settings.update.upToDateBody", { version: result.currentVersion }),
        cancelText: "",
        confirmText: "OK",
      };
    }
    if (result.kind === "unsupported") {
      return {
        icon: "ℹ️",
        title: t("settings.update.unsupportedTitle"),
        message: t("settings.update.unsupportedBody"),
        cancelText: "",
        confirmText: "OK",
      };
    }
    return {
      icon: "⚠️",
      title: t("settings.update.errorTitle"),
      message: t("settings.update.errorBody"),
      cancelText: "",
      confirmText: "OK",
    };
  })();

  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Nunito_700Bold",
          color: colors.onSurfaceMuted,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {t("settings.update.section")}
      </Text>
      <Text
        style={{
          fontSize: 11,
          fontFamily: "Nunito_400Regular",
          color: colors.onSurfaceMuted,
          marginBottom: 10,
        }}
      >
        {t("settings.update.sectionDesc", { version: currentVersion })}
      </Text>
      <View
        style={{
          backgroundColor: colors.surfaceContainer,
          borderRadius: 16,
          paddingHorizontal: 16,
        }}
      >
        <Pressable onPress={handleCheck} disabled={loading}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 14,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Nunito_600SemiBold",
                color: colors.onSurface,
              }}
            >
              {loading ? t("settings.update.checking") : t("settings.update.checkButton")}
            </Text>
            {loading ? (
              <ActivityIndicator size="small" color={colors.primaryContainer} />
            ) : (
              <Text style={{ color: colors.onSurfaceMuted, fontSize: 18 }}>›</Text>
            )}
          </View>
        </Pressable>
      </View>

      {modalConfig && (
        <ConfirmModal
          visible={!!result}
          icon={modalConfig.icon}
          title={modalConfig.title}
          message={modalConfig.message}
          cancelText={modalConfig.cancelText}
          confirmText={modalConfig.confirmText}
          onCancel={closeResult}
          onConfirm={handleConfirm}
        />
      )}
    </View>
  );
}
