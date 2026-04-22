import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useTranslation } from "react-i18next";
import { ConfirmModal } from "../components/ui/ConfirmModal";

type ConnectivityContextValue = {
  isOnline: boolean;
  requireOnline: (action: () => void) => void;
  showOfflineModal: () => void;
};

const ConnectivityContext = createContext<ConnectivityContextValue>({
  isOnline: true,
  requireOnline: (action) => action(),
  showOfflineModal: () => {},
});

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected !== false && state.isInternetReachable !== false;
      setIsOnline(connected);
    });
    NetInfo.fetch().then((state) => {
      const connected = state.isConnected !== false && state.isInternetReachable !== false;
      setIsOnline(connected);
    });
    return () => unsubscribe();
  }, []);

  const showOfflineModal = useCallback(() => setModalVisible(true), []);

  const requireOnline = useCallback(
    (action: () => void) => {
      if (isOnline) action();
      else setModalVisible(true);
    },
    [isOnline]
  );

  return (
    <ConnectivityContext.Provider value={{ isOnline, requireOnline, showOfflineModal }}>
      {children}
      <ConfirmModal
        visible={modalVisible}
        icon="📡"
        title={t("offline.title")}
        message={t("offline.message")}
        cancelText=""
        confirmText={t("offline.ok")}
        onCancel={() => setModalVisible(false)}
        onConfirm={() => setModalVisible(false)}
      />
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  return useContext(ConnectivityContext);
}
