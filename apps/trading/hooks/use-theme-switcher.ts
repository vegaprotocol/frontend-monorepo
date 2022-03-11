import { useEffect } from 'react';

export function useThemeSwitcher() {
  useEffect(() => {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const setTheme = () => {
    localStorage.theme = document.documentElement.classList.toggle('dark')
      ? 'dark'
      : undefined;
  };

  return setTheme;
}
