import create from 'zustand';
import { LocalStorage } from '../lib/storage';

const THEME_STORAGE_KEY = 'theme';
const Themes = {
  DARK: 'dark',
  LIGHT: 'light',
} as const;

type Theme = typeof Themes[keyof typeof Themes];

const validateTheme = (theme: string): theme is Theme => {
  if (Object.values(Themes).includes(theme as Theme)) return true;
  LocalStorage.removeItem(THEME_STORAGE_KEY);
  return false;
};

const setThemeClassName = (theme: Theme) => {
  if (typeof window !== 'undefined') {
    if (theme === Themes.DARK) {
      document.documentElement.classList.add(Themes.DARK);
    } else {
      document.documentElement.classList.remove(Themes.DARK);
    }
  }
};

const getCurrentTheme = () => {
  const storedTheme = LocalStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme && validateTheme(storedTheme)) {
    setThemeClassName(storedTheme);
    return storedTheme;
  }

  const theme =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' && // jest test environment matchMedia is undefined
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? Themes.DARK
      : Themes.LIGHT;

  setThemeClassName(theme);
  return theme;
};

type ThemeStore = {
  theme: Theme;
  setTheme: (theme?: Theme) => void;
};

const useThemeStore = create<ThemeStore>((set) => ({
  theme: getCurrentTheme(),
  setTheme: (newTheme) => {
    set((state) => {
      let theme: Theme =
        state.theme === Themes.LIGHT ? Themes.DARK : Themes.LIGHT;

      if (newTheme) {
        theme = newTheme;
      }

      LocalStorage.setItem(THEME_STORAGE_KEY, theme);

      setThemeClassName(theme);

      return {
        theme,
      };
    });
  },
}));

export function useThemeSwitcher(): ThemeStore {
  const { theme, setTheme } = useThemeStore();
  return { theme, setTheme };
}
