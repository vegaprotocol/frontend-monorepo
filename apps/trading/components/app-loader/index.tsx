import type { ReactNode } from 'react';
import { useEagerConnect } from '@vegaprotocol/wallet';
import { NetworkLoader } from '@vegaprotocol/environment';
import { Connectors } from '../../lib/vega-connectors';
import type { InMemoryCacheConfig } from '@apollo/client';

interface AppLoaderProps {
  children: ReactNode;
}

/**
 * Component to handle any app initialization, startup queries and other things
 * that must happen for it can be used
 */
export function AppLoader({ children }: AppLoaderProps) {
  // Get keys from vega wallet immediately
  useEagerConnect(Connectors);
  const cache: InMemoryCacheConfig = {
    typePolicies: {
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
        keyFields: ['instrument'],
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
      PositionUpdate: {
        keyFields: false,
      },
      AccountUpdate: {
        keyFields: false,
      },
    },
  };
  return <NetworkLoader cache={cache}>{children}</NetworkLoader>;
}
