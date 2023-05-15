import React from 'react';

import type { BigNumber } from '../../lib/bignumber';

export enum VegaWalletStatus {
  /** Detecting if Vega wallet service is running */
  Pending,
  /** Vega wallet service is running */
  Ready,
  /** No Vega wallet not running */
  None,
}

export interface VegaKey {
  pub: string;
  algo: string;
  tainted: boolean;
  meta: Array<{ key: string; value: string }> | null;
}

export interface AppState {
  /** Number of decimal places of the VEGA token (18 on Mainnet, 5 on Testnet) */
  decimals: number;

  /** Total supply of VEGA tokens */
  totalSupply: BigNumber;

  /** Total number of VEGA Tokens, both vesting and unlocked, associated for staking */
  totalAssociated: BigNumber;

  /** Whether or not the connect to VEGA wallet overlay is open */
  vegaWalletOverlay: boolean;

  /** Whether or not the manage VEGA wallet overlay is open */
  vegaWalletManageOverlay: boolean;

  /**  Whether or not the transaction modal is open */
  transactionOverlay: boolean;
  /**
   * Message to display in a banner at the top of the screen, currently always shown as a warning/error
   */
  bannerMessage: string;
  /**
   * Displays a notice to the user that they have been disconnected because they've changed their
   * ethereum network to an incompatible one.
   */
  disconnectNotice: boolean;
}

export enum AppStateActionType {
  UPDATE_ACCOUNT_BALANCES,
  SET_TOKEN,
  SET_ALLOWANCE,
  REFRESH_BALANCES,
  SET_VEGA_WALLET_OVERLAY,
  SET_VEGA_WALLET_MANAGE_OVERLAY,
  SET_DRAWER,
  REFRESH_ASSOCIATED_BALANCES,
  SET_ASSOCIATION_BREAKDOWN,
  SET_TRANSACTION_OVERLAY,
  SET_BANNER_MESSAGE,
  SET_DISCONNECT_NOTICE,
}

export type AppStateAction =
  | {
      type: AppStateActionType.SET_TOKEN;
      decimals: number;
      totalSupply: BigNumber;
      totalAssociated: BigNumber;
    }
  | {
      type: AppStateActionType.SET_VEGA_WALLET_OVERLAY;
      isOpen: boolean;
    }
  | {
      type: AppStateActionType.SET_VEGA_WALLET_MANAGE_OVERLAY;
      isOpen: boolean;
    }
  | {
      type: AppStateActionType.SET_DRAWER;
      isOpen: boolean;
    }
  | {
      type: AppStateActionType.SET_TRANSACTION_OVERLAY;
      isOpen: boolean;
    }
  | {
      type: AppStateActionType.SET_BANNER_MESSAGE;
      message: string;
    }
  | {
      type: AppStateActionType.SET_DISCONNECT_NOTICE;
      isVisible: boolean;
    };

type AppStateContextShape = {
  appState: AppState;
  appDispatch: React.Dispatch<AppStateAction>;
};

export const AppStateContext = React.createContext<
  AppStateContextShape | undefined
>(undefined);

export function useAppState() {
  const context = React.useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}
