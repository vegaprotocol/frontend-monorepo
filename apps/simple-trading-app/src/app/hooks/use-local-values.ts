import { useMemo, useState } from 'react';
import type { LocalValues } from '../context/local-context';

const useLocalValues = (toggleTheme: () => void) => {
  const [connect, setConnect] = useState<boolean>(false);
  const [manage, setManage] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState(false);
  return useMemo<LocalValues>(
    () => ({
      vegaWalletDialog: { connect, manage, setConnect, setManage },
      menu: { menuOpen, setMenuOpen, onToggle: () => setMenuOpen(!menuOpen) },
      toggleTheme,
    }),
    [connect, manage, toggleTheme, menuOpen]
  );
};

export default useLocalValues;
