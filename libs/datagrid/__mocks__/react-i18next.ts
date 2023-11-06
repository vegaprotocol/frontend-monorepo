export const useTranslation = () => ({
  t: (label: string, replacements?: Record<string, string>) => {
    const replace =
      replacements?.['replace'] && typeof replacements === 'object'
        ? replacements?.['replace']
        : replacements;
    let translatedLabel = replacements?.['defaultValue'] || label;
    if (typeof replace === 'object' && replace !== null) {
      Object.keys(replace).forEach((key) => {
        translatedLabel = translatedLabel.replace(`{{${key}}}`, replace[key]);
      });
    }
    return translatedLabel;
  },
});
