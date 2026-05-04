import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
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

// Modal lives in a sibling subtree so toggling its visibility doesn't re-render
// the provider's value (which would cascade to every consumer).
function OfflineModalHost({
  modalVisible,
  setModalVisible,
}: {
  modalVisible: boolean;
  setModalVisible: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
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
  );
}

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const isOnlineRef = useRef(isOnline);

  useEffect(() => {
    isOnlineRef.current = isOnline;
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected =
        state.isConnected !== false && state.isInternetReachable !== false;
      setIsOnline(connected);
    });
    NetInfo.fetch().then((state) => {
      const connected =
        state.isConnected !== false && state.isInternetReachable !== false;
      setIsOnline(connected);
    });
    return () => unsubscribe();
  }, []);

  const showOfflineModal = useCallback(() => setModalVisible(true), []);

  // Reads isOnline through ref so the callback identity stays stable —
  // requireOnline doesn't change between renders.
  const requireOnline = useCallback((action: () => void) => {
    if (isOnlineRef.current) action();
    else setModalVisible(true);
  }, []);

  const value = useMemo(
    () => ({ isOnline, requireOnline, showOfflineModal }),
    [isOnline, requireOnline, showOfflineModal],
  );

  return (
    <ConnectivityContext.Provider value={value}>
      {children}
      <OfflineModalHost
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  return useContext(ConnectivityContext);
}
