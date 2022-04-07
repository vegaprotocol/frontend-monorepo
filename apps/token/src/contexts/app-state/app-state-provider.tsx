import React from "react";

import { BigNumber } from "../../lib/bignumber";
import { truncateMiddle } from "../../lib/truncate-middle";
import {
  AppState,
  AppStateAction,
  AppStateActionType,
  AppStateContext,
  VegaWalletStatus,
} from "./app-state-context";

interface AppStateProviderProps {
  children: React.ReactNode;
}

const initialAppState: AppState = {
  // set in app-loader TODO: update when user stakes/unstakes/associates/disassociates
  totalAssociated: new BigNumber(0),
  decimals: 0,
  totalSupply: new BigNumber(0),
  balanceFormatted: new BigNumber(0),
  walletBalance: new BigNumber(0),
  lien: new BigNumber(0),
  allowance: new BigNumber(0),
  tranches: null,
  vegaWalletOverlay: false,
  ethConnectOverlay: false,
  vegaWalletStatus: VegaWalletStatus.Pending,
  vegaKeys: null,
  currVegaKey: null,
  walletAssociatedBalance: null,
  vestingAssociatedBalance: null,
  trancheBalances: [],
  totalLockedBalance: new BigNumber(0),
  totalVestedBalance: new BigNumber(0),
  trancheError: null,
  drawerOpen: false,
  associationBreakdown: {
    vestingAssociations: {},
    stakingAssociations: {},
  },
  transactionOverlay: false,
  bannerMessage: "",
};

function appStateReducer(state: AppState, action: AppStateAction): AppState {
  switch (action.type) {
    case AppStateActionType.UPDATE_ACCOUNT_BALANCES: {
      return {
        ...state,
        balanceFormatted: action.balance,
        walletBalance: action.walletBalance,
        allowance: action.allowance,
        lien: action.lien,
      };
    }
    case AppStateActionType.REFRESH_BALANCES: {
      return {
        ...state,
        balanceFormatted: action.balance,
        walletBalance: action.walletBalance,
        allowance: action.allowance,
        lien: action.lien,
        walletAssociatedBalance: action.walletAssociatedBalance,
        vestingAssociatedBalance: action.vestingAssociatedBalance,
      };
    }
    case AppStateActionType.VEGA_WALLET_INIT: {
      if (!action.keys) {
        return { ...state, vegaWalletStatus: VegaWalletStatus.Ready };
      }

      const vegaKeys = action.keys.map((k) => {
        const alias = k.meta?.find((m) => m.key === "name");
        return {
          ...k,
          alias: alias?.value || "No alias",
          pubShort: truncateMiddle(k.pub),
        };
      });
      const selectedKey =
        vegaKeys.find((a) => a.pub === action.key) || vegaKeys[0];
      return {
        ...state,
        vegaKeys,
        currVegaKey: selectedKey ? selectedKey : null,
        vegaWalletStatus: VegaWalletStatus.Ready,
      };
    }
    case AppStateActionType.VEGA_WALLET_SET_KEY: {
      return {
        ...state,
        currVegaKey: action.key,
      };
    }
    case AppStateActionType.VEGA_WALLET_DOWN: {
      return {
        ...state,
        vegaWalletStatus: VegaWalletStatus.None,
      };
    }
    case AppStateActionType.VEGA_WALLET_DISCONNECT: {
      return {
        ...state,
        currVegaKey: null,
        vegaKeys: null,
      };
    }
    case AppStateActionType.SET_TOKEN: {
      return {
        ...state,
        decimals: action.decimals,
        totalSupply: action.totalSupply,
        totalAssociated: action.totalAssociated,
      };
    }
    case AppStateActionType.SET_ALLOWANCE: {
      return {
        ...state,
        allowance: action.allowance,
      };
    }
    case AppStateActionType.SET_TRANCHE_DATA:
      return {
        ...state,
        tranches: action.tranches,
        totalVestedBalance: BigNumber.sum.apply(null, [
          new BigNumber(0),
          ...action.trancheBalances.map((b) => b.vested),
        ]),
        totalLockedBalance: BigNumber.sum.apply(null, [
          new BigNumber(0),
          ...action.trancheBalances.map((b) => b.locked),
        ]),
        trancheBalances: action.trancheBalances,
      };
    case AppStateActionType.SET_TRANCHE_ERROR: {
      return {
        ...state,
        trancheError: action.error,
      };
    }
    case AppStateActionType.SET_VEGA_WALLET_OVERLAY: {
      return {
        ...state,
        vegaWalletOverlay: action.isOpen,
        drawerOpen: action.isOpen ? false : state.drawerOpen,
      };
    }
    case AppStateActionType.SET_ETH_WALLET_OVERLAY: {
      return {
        ...state,
        ethConnectOverlay: action.isOpen,
        drawerOpen: action.isOpen ? false : state.drawerOpen,
      };
    }
    case AppStateActionType.SET_DRAWER: {
      return {
        ...state,
        drawerOpen: action.isOpen,
        vegaWalletOverlay: false,
      };
    }
    case AppStateActionType.REFRESH_ASSOCIATED_BALANCES: {
      return {
        ...state,
        walletAssociatedBalance: action.walletAssociatedBalance,
        vestingAssociatedBalance: action.vestingAssociatedBalance,
      };
    }
    case AppStateActionType.SET_ASSOCIATION_BREAKDOWN: {
      return {
        ...state,
        associationBreakdown: { ...action.breakdown },
      };
    }
    case AppStateActionType.SET_TRANSACTION_OVERLAY: {
      return {
        ...state,
        transactionOverlay: action.isOpen,
      };
    }
    case AppStateActionType.SET_BANNER_MESSAGE: {
      return {
        ...state,
        bannerMessage: action.message,
      };
    }
  }
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, dispatch] = React.useReducer(appStateReducer, initialAppState);

  return (
    <AppStateContext.Provider
      value={{
        appState: state,
        appDispatch: dispatch,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}
