import i18n from '@/i18n';
import type DEFAULT_LANG_PACK from '../../locales/en.json';

export type TKey = keyof typeof DEFAULT_LANG_PACK;
type TOptions = Parameters<typeof i18n.t>[2];

export function t(key: TKey, options?: TOptions) {
  return i18n.t(key, options);
}
