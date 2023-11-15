import { useTranslation } from 'react-i18next';
export const ns = 'utils';
export const useT = () => useTranslation(ns).t;
