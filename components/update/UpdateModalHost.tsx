import { useTranslation } from "react-i18next";

import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useInAppUpdate } from "@/hooks/useInAppUpdate";

export function UpdateModalHost() {
  const { t } = useTranslation();
  const { status, confirm, dismiss, installNow } = useInAppUpdate();

  if (status.kind === "available") {
    return (
      <ConfirmModal
        visible
        icon="🚀"
        title={t("update.available.title")}
        message={t("update.available.message")}
        cancelText={t("update.later")}
        confirmText={t("update.confirm")}
        confirmIcon="⬇️"
        onCancel={dismiss}
        onConfirm={confirm}
      />
    );
  }

  if (status.kind === "readyToInstall") {
    return (
      <ConfirmModal
        visible
        icon="✨"
        title={t("update.ready.title")}
        message={t("update.ready.message")}
        cancelText=""
        confirmText={t("update.install")}
        confirmIcon="🔄"
        onCancel={() => undefined}
        onConfirm={installNow}
      />
    );
  }

  return null;
}
