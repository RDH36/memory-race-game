import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";

import fr from "./locales/fr.json";
import en from "./locales/en.json";

const LANGUAGE_KEY = "app_language";

export const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
] as const;

const resources = {
  fr: { translation: fr },
  en: { translation: en },
};

const initI18n = async () => {
  const saved = await AsyncStorage.getItem(LANGUAGE_KEY).catch(() => null);
  const deviceLang = getLocales()[0]?.languageCode ?? "fr";
  const lng = saved ?? (deviceLang in resources ? deviceLang : "fr");

  await i18next.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: "fr",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
};

initI18n();

export async function setLanguage(code: string) {
  await AsyncStorage.setItem(LANGUAGE_KEY, code);
  await i18next.changeLanguage(code);
}

export default i18next;
