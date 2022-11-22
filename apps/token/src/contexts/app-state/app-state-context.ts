import type { Tranche } from '@vegaprotocol/smart-contracts';
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

export interface UserTrancheBalance {
  /** ID of tranche */
  id: number;

  /** Users vesting tokens on tranche */
  locked: BigNumber;

  /** Users vested tokens on tranche */
  vested: BigNumber;
}

export interface AppState {
  /** Array of tranche objects */
  tranches: Tranche[] | null;

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

  /** Whether or not the connect to Ethereum wallet overlay is open */
  ethConnectOverlay: boolean;

  /** The error if one was thrown during retrieval of tranche data */
  trancheError: Error | null;

  /** Whether or not the mobile drawer is open. Only relevant on screens smaller than 960 */
  drawerOpen: boolean;

  /**  Whether or not the transaction modal is open */
  transactionOverlay: boolean;
  /**
   * Message to display in a banner at the top of the screen, currently always shown as a warning/error
   */
  bannerMessage: string;
}

export enum AppStateActionType {
  UPDATE_ACCOUNT_BALANCES,
  SET_TOKEN,
  SET_ALLOWANCE,
  REFRESH_BALANCES,
  SET_TRANCHE_DATA,
  SET_VEGA_WALLET_OVERLAY,
  SET_VEGA_WALLET_MANAGE_OVERLAY,
  SET_ETH_WALLET_OVERLAY,
  SET_DRAWER,
  SET_TRANCHE_ERROR,
  REFRESH_ASSOCIATED_BALANCES,
  SET_ASSOCIATION_BREAKDOWN,
  SET_TRANSACTION_OVERLAY,
  SET_BANNER_MESSAGE,
}

export type AppStateAction =
  | {
      type: AppStateActionType.SET_TOKEN;
      decimals: number;
      totalSupply: BigNumber;
      totalAssociated: BigNumber;
    }
  | {
      type: AppStateActionType.SET_TRANCHE_DATA;
      tranches: Tranche[];
    }
  | {
      type: AppStateActionType.SET_TRANCHE_ERROR;
      error: Error | null;
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
      type: AppStateActionType.SET_ETH_WALLET_OVERLAY;
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
