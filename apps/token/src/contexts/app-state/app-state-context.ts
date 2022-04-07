import { Tranche } from "@vegaprotocol/smart-contracts-sdk";
import React from "react";

import { BigNumber } from "../../lib/bignumber";

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

export interface VegaKeyExtended extends VegaKey {
  alias: string;
  pubShort: string;
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
  /** Users vesting balance across all tranches */
  balanceFormatted: BigNumber;

  /** Users balance of VEGA in Metamask */
  walletBalance: BigNumber;

  /** Amount of tokens associated for a given eth address  */
  lien: BigNumber;

  /** Array of tranche objects */
  tranches: Tranche[] | null;

  /** Number of decimal places of the VEGA token (18 on Mainnet, 5 on Ropsten) */
  decimals: number;

  /** Total supply of VEGA tokens */
  totalSupply: BigNumber;

  /** Total number of VEGA Tokens, both vesting and unlocked, associated for staking */
  totalAssociated: BigNumber;

  /** Users total unlocked tokens */
  totalVestedBalance: BigNumber;

  /** Users total locked (vesting) tokens */
  totalLockedBalance: BigNumber;

  /** Breakdown of users vesting/vested balances across tranches */
  trancheBalances: UserTrancheBalance[];

  /** Approved amount of VEGA to be associated for staking */
  allowance: BigNumber;

  /** Whether or not the connect to VEGA wallet overlay is open */
  vegaWalletOverlay: boolean;

  /** Whether or not the connect to Ethereum wallet overlay is open */
  ethConnectOverlay: boolean;

  /** Whether or not a Vega wallet service is running, can be Pending, Ready or None */
  vegaWalletStatus: VegaWalletStatus;

  /** Array of Vega key objects provided by the Vega wallet service */
  vegaKeys: VegaKeyExtended[] | null;

  /** Current selected Vega key */
  currVegaKey: VegaKeyExtended | null;

  /** Amount of tokens associated with the current Vega key from wallet*/
  walletAssociatedBalance: BigNumber | null;

  /** Amount of tokens associated with the current Vega key from vesting contract*/
  vestingAssociatedBalance: BigNumber | null;

  /** The error if one was thrown during retrieval of tranche data */
  trancheError: Error | null;

  /** Whether or not the mobile drawer is open. Only relevant on screens smaller than 960 */
  drawerOpen: boolean;

  /**
   * A breakdown of associations by Vega key. An object where each key is the vega key and
   * the value is the total amount associated (staking and vesting combined) to that key.
   */
  associationBreakdown: {
    stakingAssociations: { [vegaKey: string]: BigNumber };
    vestingAssociations: { [vegaKey: string]: BigNumber };
  };

  /**  Whether or not the transaction modal is open */
  transactionOverlay: boolean;
  /**
   * Message to display in a banner at the top of the screen, currently always shown as a warning/error
   */
  bannerMessage: string;
}

export enum AppStateActionType {
  UPDATE_ACCOUNT_BALANCES,
  VEGA_WALLET_INIT,
  VEGA_WALLET_SET_KEY,
  VEGA_WALLET_DOWN,
  VEGA_WALLET_DISCONNECT,
  SET_TOKEN,
  SET_ALLOWANCE,
  REFRESH_BALANCES,
  SET_TRANCHE_DATA,
  SET_VEGA_WALLET_OVERLAY,
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
      type: AppStateActionType.UPDATE_ACCOUNT_BALANCES;
      balance: BigNumber;
      walletBalance: BigNumber;
      lien: BigNumber;
      allowance: BigNumber;
    }
  | {
      type: AppStateActionType.VEGA_WALLET_INIT;
      keys: VegaKey[] | null | undefined;
      key: string | undefined;
    }
  | {
      type: AppStateActionType.VEGA_WALLET_SET_KEY;
      key: VegaKeyExtended;
    }
  | { type: AppStateActionType.VEGA_WALLET_DOWN }
  | { type: AppStateActionType.VEGA_WALLET_DISCONNECT }
  | {
      type: AppStateActionType.SET_TOKEN;
      decimals: number;
      totalSupply: BigNumber;
      totalAssociated: BigNumber;
    }
  | {
      type: AppStateActionType.SET_ALLOWANCE;
      allowance: BigNumber;
    }
  | {
      type: AppStateActionType.REFRESH_BALANCES;
      balance: BigNumber;
      walletBalance: BigNumber;
      lien: BigNumber;
      allowance: BigNumber;
      walletAssociatedBalance: BigNumber | null;
      vestingAssociatedBalance: BigNumber | null;
    }
  | {
      type: AppStateActionType.SET_TRANCHE_DATA;
      trancheBalances: UserTrancheBalance[];
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
      type: AppStateActionType.SET_ETH_WALLET_OVERLAY;
      isOpen: boolean;
    }
  | {
      type: AppStateActionType.SET_DRAWER;
      isOpen: boolean;
    }
  | {
      type: AppStateActionType.REFRESH_ASSOCIATED_BALANCES;
      walletAssociatedBalance: BigNumber;
      vestingAssociatedBalance: BigNumber;
    }
  | {
      type: AppStateActionType.SET_ASSOCIATION_BREAKDOWN;
      breakdown: {
        stakingAssociations: { [vegaKey: string]: BigNumber };
        vestingAssociations: { [vegaKey: string]: BigNumber };
      };
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
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
