/**
 * A stand in for real i18n - this function should
 * be used wherever text is placed in the UI so that
 * in future they can easily be extracted
 *
 * @param str A
 * @returns str A
 */
export const t = (str: string, replacements?: string | string[]) => {
  if (replacements) {
    let i = 0;
    return str.replace(/%s/g, () => {
      return (
        (Array.isArray(replacements) ? replacements : [replacements])[i++] ||
        '%s'
      );
    });
  }
  return str;
};
