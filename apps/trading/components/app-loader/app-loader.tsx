import type { InMemoryCacheConfig } from '@apollo/client';
import {
  AppFailure,
  NetworkLoader,
  NodeGuard,
  useEnvironment,
} from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import { MaintenancePage } from '@vegaprotocol/ui-toolkit';
import { VegaWalletProvider } from '@vegaprotocol/wallet';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { Web3Provider } from './web3-provider';

export const DynamicLoader = dynamic(() => import('../preloader/preloader'), {
  loading: () => <>Loading...</>,
});

export const AppLoader = ({ children }: { children: ReactNode }) => {
  const { error, VEGA_URL, MAINTENANCE_PAGE } = useEnvironment((store) => ({
    error: store.error,
    VEGA_URL: store.VEGA_URL,
    MAINTENANCE_PAGE: store.MAINTENANCE_PAGE,
  }));

  if (MAINTENANCE_PAGE) {
    return <MaintenancePage />;
  }

  return (
    <NetworkLoader
      cache={cacheConfig}
      skeleton={<DynamicLoader />}
      failure={
        <AppFailure title={t('Could not initialize app')} error={error} />
      }
    >
      <NodeGuard
        skeleton={<DynamicLoader />}
        failure={<AppFailure title={t(`Node: ${VEGA_URL} is unsuitable`)} />}
      >
        <Web3Provider>
          <VegaWalletProvider>{children}</VegaWalletProvider>
        </Web3Provider>
      </NodeGuard>
    </NetworkLoader>
  );
};

const cacheConfig: InMemoryCacheConfig = {
  typePolicies: {
    Statistics: {
      merge: (existing, incoming) => {
        return {
          ...existing,
          ...incoming,
        };
      },
    },
    Account: {
      keyFields: false,
      fields: {
        balanceFormatted: {},
      },
    },
    Instrument: {
      keyFields: false,
    },
    TradableInstrument: {
      keyFields: false,
    },
    Product: {
      keyFields: ['settlementAsset', ['id']],
    },
    MarketData: {
      keyFields: ['market', ['id']],
    },
    Node: {
      keyFields: false,
    },
    Withdrawal: {
      fields: {
        pendingOnForeignChain: {
          read: (isPending = false) => isPending,
        },
      },
    },
    ERC20: {
      keyFields: ['contractAddress'],
    },
    Party: {
      keyFields: false,
    },
    Position: {
      keyFields: ['market', ['id'], 'party', ['id']],
    },
    Fees: {
      keyFields: false,
    },
    // The folling types are cached by the data provider and not by apollo
    PositionUpdate: {
      keyFields: false,
    },
    TradeUpdate: {
      keyFields: false,
    },
    AccountUpdate: {
      keyFields: false,
    },
    OrderUpdate: {
      keyFields: false,
    },
  },
};
