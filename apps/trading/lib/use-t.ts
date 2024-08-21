import { useTranslation } from 'react-i18next';

import type DEFAULT_LANG_PACK from '../../../libs/i18n/src/locales/en/trading.json';
import i18n from './i18n';

export const ns = 'trading';
export const useT = () => useTranslation('trading').t;
export const useI18n = () => useTranslation('trading').i18n;

export type TKey = keyof typeof DEFAULT_LANG_PACK;
type TOptions = Parameters<typeof i18n.t>[2];
export function t(key: TKey, options?: TOptions) {
  return i18n.t(key, { ns: 'trading', ...options });
}
