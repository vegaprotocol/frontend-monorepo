import React from 'react';

import { BigNumber } from '../../lib/bignumber';
import type { AppState, AppStateAction } from './app-state-context';
import { AppStateActionType, AppStateContext } from './app-state-context';

interface AppStateProviderProps {
  children: React.ReactNode;
  initialState?: Partial<AppState>;
}

const initialAppState: AppState = {
  // set in app-loader TODO: update when user stakes/unstakes/associates/disassociates
  totalAssociated: new BigNumber(0),
  decimals: 0,
  totalSupply: new BigNumber(0),
  vegaWalletManageOverlay: false,
  transactionOverlay: false,
  bannerMessage: '',
  disconnectNotice: false,
  embeddedWalletOpen: false,
};

function appStateReducer(state: AppState, action: AppStateAction): AppState {
  switch (action.type) {
    case AppStateActionType.SET_TOKEN: {
      return {
        ...state,
        decimals: action.decimals,
        totalSupply: action.totalSupply,
        totalAssociated: action.totalAssociated,
      };
    }
    case AppStateActionType.SET_VEGA_WALLET_MANAGE_OVERLAY: {
      return {
        ...state,
        vegaWalletManageOverlay: action.isOpen,
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
    case AppStateActionType.SET_DISCONNECT_NOTICE: {
      return {
        ...state,
        disconnectNotice: action.isVisible,
      };
    }
    case AppStateActionType.SET_EMBEDDED_WALLET_MANAGE_OVERLAY: {
      return {
        ...state,
        embeddedWalletOpen: action.isOpen,
      };
    }
  }
}

export function AppStateProvider({
  children,
  initialState,
}: AppStateProviderProps) {
  const [state, dispatch] = React.useReducer(appStateReducer, {
    ...initialAppState,
    ...initialState,
  });

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
