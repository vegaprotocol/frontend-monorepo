import type { InMemoryCacheConfig } from '@apollo/client';

export const DEFAULT_CACHE_CONFIG: InMemoryCacheConfig = {
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
    Party: {
      keyFields: false,
    },
    Fees: {
      keyFields: false,
    },
    statistics: {
      keyFields: false,
    },
    Game: {
      keyFields: false,
    },
  },
};
