import { useMemo, useState } from 'react';
import type { LocalValues } from '../context/local-context';

const useLocalValues = (theme: 'light' | 'dark', toggleTheme: () => void) => {
  const [manage, setManage] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState(false);
  return useMemo<LocalValues>(
    () => ({
      vegaWalletDialog: { manage, setManage },
      menu: { menuOpen, setMenuOpen, onToggle: () => setMenuOpen(!menuOpen) },
      theme,
      toggleTheme,
    }),
    [manage, theme, toggleTheme, menuOpen]
  );
};

export default useLocalValues;
