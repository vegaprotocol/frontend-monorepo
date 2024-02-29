import type { InMemoryCacheConfig } from '@apollo/client';
import {
  AppFailure,
  AppLoader,
  NetworkLoader,
  NodeFailure,
  NodeGuard,
  useEnvironment,
} from '@vegaprotocol/environment';
import type { ReactNode } from 'react';
import { Web3Provider } from './web3-provider';
import { useT } from '../../lib/use-t';
import { DataLoader } from './data-loader';
import { VegaWalletProvider } from '@vegaprotocol/wallet';
import { config } from '../../lib/vega-wallet';

export const Bootstrapper = ({ children }: { children: ReactNode }) => {
  const t = useT();
  const { error, VEGA_URL } = useEnvironment();

  // const chainId = useChainId(VEGA_URL);

  return (
    <NetworkLoader
      cache={cacheConfig}
      skeleton={<AppLoader />}
      failure={
        <AppFailure title={t('Could not initialize app')} error={error} />
      }
    >
      <NodeGuard
        skeleton={<AppLoader />}
        failure={
          <NodeFailure
            title={t('Node: {{VEGA_URL}} is unsuitable', { VEGA_URL })}
          />
        }
      >
        <DataLoader
          skeleton={<AppLoader />}
          failure={
            <AppFailure
              title={t('Could not load market data or asset data')}
              error={error}
            />
          }
        >
          <Web3Provider
            skeleton={<AppLoader />}
            failure={
              <AppFailure title={t('Could not configure web3 provider')} />
            }
          >
            <VegaWalletProvider config={config}>{children}</VegaWalletProvider>
          </Web3Provider>
        </DataLoader>
      </NodeGuard>
    </NetworkLoader>
  );
};

const cacheConfig: InMemoryCacheConfig = {
  typePolicies: {
    Statistics: {
      merge: true,
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
    Game: {
      keyFields: false,
    },
  },
};
