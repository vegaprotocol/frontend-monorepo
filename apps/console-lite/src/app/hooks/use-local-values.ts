import { useMemo, useState } from 'react';
import type { LocalValues } from '../context/local-context';

const useLocalValues = () => {
  const [manage, setManage] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState(false);
  return useMemo<LocalValues>(
    () => ({
      vegaWalletDialog: { manage, setManage },
      menu: { menuOpen, setMenuOpen, onToggle: () => setMenuOpen(!menuOpen) },
    }),
    [manage, menuOpen]
  );
};

export default useLocalValues;
