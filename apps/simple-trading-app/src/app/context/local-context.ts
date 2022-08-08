import { createContext } from 'react';

export interface VegaWalletDialogState {
  connect: boolean;
  manage: boolean;
}

export interface LocalValues {
  vegaWalletDialog: VegaWalletDialogState;
  setConnect: (isOpen: boolean) => void;
  setManage: (isOpen: boolean) => void;
}

const LocalContext = createContext<LocalValues>({} as LocalValues);

export default LocalContext;
