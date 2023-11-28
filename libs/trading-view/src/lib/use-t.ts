import { useTranslation } from 'react-i18next';
export const ns = 'trading-view';
export const useT = () => useTranslation(ns).t;
export const useLanguage = () => useTranslation(ns).i18n.language;
