export const useTranslation = () => ({
  t: (label: string, replacements?: Record<string, string>) => {
    let translatedLabel = label;
    if (typeof replacements === 'object' && replacements !== null) {
      Object.keys(replacements).forEach((key) => {
        translatedLabel = translatedLabel.replace(
          `{{${key}}}`,
          replacements[key]
        );
      });
    }
    return translatedLabel;
  },
});
