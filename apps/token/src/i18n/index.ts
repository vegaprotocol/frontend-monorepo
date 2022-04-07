import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { Flags } from "../config";
import dev from "./translations/dev.json";
import en from "./translations/en-US.json";
import fr from "./translations/fr-FR.json";
import ru from "./translations/ru-RU.json";
import zh from "./translations/zh-CN.json";
import zu from "./translations/zu-ZA.json";

const isInContextTranslation = Flags.IN_CONTEXT_TRANSLATION;

const psuedoLanguage = {
  keys: zu,
  locale: "zu-ZA",
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // we init with resources
    resources: {
      en: {
        translations: {
          ...dev,
          ...en,
        },
      },
      fr: { translations: fr },
      ru: { translations: ru },
      zh: { translations: zh },
      ...(isInContextTranslation ? { zu: { translations: zu } } : {}),
    },
    lng: isInContextTranslation ? psuedoLanguage.locale : undefined,
    fallbackLng: "en",
    debug: true,
    // have a common namespace used around the full app
    ns: ["translations"],
    defaultNS: "translations",
    keySeparator: false, // we use content as keys

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
