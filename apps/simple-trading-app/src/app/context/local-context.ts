import { createContext } from 'react';

export interface VegaWalletDialogState {
  connect: boolean;
  manage: boolean;
  setConnect: (isOpen: boolean) => void;
  setManage: (isOpen: boolean) => void;
}

export interface LocalValues {
  vegaWalletDialog: VegaWalletDialogState;
}

const LocalContext = createContext<LocalValues>({} as LocalValues);

export default LocalContext;
