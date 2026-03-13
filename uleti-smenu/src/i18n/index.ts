import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en";
import sr from "./sr";

const LANGUAGE_STORAGE_KEY = "appLanguage";

const getInitialLanguage = () => {
  if (typeof window === "undefined") {
    return "sr";
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (savedLanguage === "en" || savedLanguage === "sr") {
    return savedLanguage;
  }

  return "sr";
};

const initialLanguage = getInitialLanguage();

i18n.use(initReactI18next).init({
  resources: {
    sr: { translation: sr },
    en: { translation: en }
  },
  lng: initialLanguage,
  fallbackLng: "sr",
  interpolation: {
    escapeValue: false
  }
});

if (typeof window !== "undefined") {
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, initialLanguage);
  document.documentElement.lang = initialLanguage;
  i18n.on("languageChanged", (language) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  });
}

export default i18n;
