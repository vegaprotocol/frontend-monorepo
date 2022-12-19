import { useEffect } from 'react';
import create from 'zustand';
import { LocalStorage } from '../lib/storage';

const darkTheme = 'dark';
const lightTheme = 'light';
type Theme = typeof darkTheme | typeof lightTheme;

const darkThemeCssClass = darkTheme;

const isValidTheme = (theme: string): theme is Theme => {
  if (theme === 'light' || theme === 'dark') return true;
  return false;
};

const setTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;

  if (theme === 'dark') {
    document.documentElement.classList.add(darkThemeCssClass);
    LocalStorage.setItem('theme', darkTheme);
  } else {
    document.documentElement.classList.remove(darkThemeCssClass);
    LocalStorage.setItem('theme', lightTheme);
  }
};

const getCurrentTheme = () => {
  const theme = LocalStorage.getItem('theme');

  if (theme && isValidTheme(theme)) {
    setTheme(theme);
    return theme;
  } else {
    LocalStorage.removeItem('theme');
  }

  if (
    !theme &&
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    setTheme(darkTheme);
    return darkTheme;
  }

  setTheme(lightTheme);
  return lightTheme;
};

type ThemeStore = {
  theme: Theme;
  setTheme: (theme?: Theme) => void;
};

const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: getCurrentTheme(),
  setTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    set({ theme: newTheme });
  },
}));

export function useThemeSwitcher(): ThemeStore {
  const { theme, setTheme } = useThemeStore();
  return { theme, setTheme };
}
