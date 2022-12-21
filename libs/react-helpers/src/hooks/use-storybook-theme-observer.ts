import { useMutationObserver } from './use-mutation-observer';
import { useThemeSwitcher } from './use-theme-switcher';

/**
 * Listens for theme classname changes on the body tag and applies the
 * same theme to the theme store. This is required as some components
 * (EG AgGrid) rely on the theme as a JS variable rather than purely a className
 *
 * Additionally storybook-addon-themes doesn't seem to provide the current selected
 * theme in context so we listen for changes on the body tag
 */
export const useStorybookThemeObserver = () => {
  const { setTheme } = useThemeSwitcher();

  useMutationObserver(document.body, (mutationList) => {
    if (mutationList.length) {
      const body = mutationList[0].target as HTMLElement;
      if (body && body.classList.contains('dark')) {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    }
  });
};
