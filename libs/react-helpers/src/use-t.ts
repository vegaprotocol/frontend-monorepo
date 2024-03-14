import { useTranslation } from 'react-i18next';
export const ns = 'react-helpers';
export const useT = () => useTranslation(ns).t;
