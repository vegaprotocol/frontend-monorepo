import { createContext } from 'react';

export interface VegaWalletDialogState {
  connect: boolean;
  manage: boolean;
  setConnect: (isOpen: boolean) => void;
  setManage: (isOpen: boolean) => void;
}

interface MenuState {
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
  onToggle: () => void;
}

export interface LocalValues {
  vegaWalletDialog: VegaWalletDialogState;
  menu: MenuState;
  toggleTheme: () => void;
}

const LocalContext = createContext<LocalValues>({} as LocalValues);

export default LocalContext;
