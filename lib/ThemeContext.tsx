import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightColors, darkColors, type ThemeColors } from "../components/ui/theme";

export type ThemeMode = "system" | "light" | "dark";

const STORAGE_KEY = "theme_mode";

type ThemeContextValue = {
  colors: ThemeColors;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
  themeMode: "system",
  setThemeMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeModeState(stored);
      }
      setLoaded(true);
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(STORAGE_KEY, mode);
  };

  const resolvedMode = loaded ? themeMode : "system";
  const isDark =
    resolvedMode === "dark" || (resolvedMode === "system" && systemScheme === "dark");

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark, themeMode: resolvedMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
