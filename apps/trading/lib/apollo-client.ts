import {
  type ApolloClient,
  type InMemoryCacheConfig,
  type NormalizedCacheObject,
} from '@apollo/client';
import { createClient } from '@vegaprotocol/apollo-client';

const cache: InMemoryCacheConfig = {
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
    PartyProfile: {
      keyFields: ['partyId'],
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
    RecurringTransfer: {
      keyFields: false,
    },
    RecurringGovernanceTransfer: {
      keyFields: false,
    },
    TeamGameEntity: {
      keyFields: false,
    },
    TeamEntity: {
      keyFields: false,
    },
  },
};

let apolloClient: ApolloClient<NormalizedCacheObject>;
let cachedUrl: string | undefined;

export const getApolloClient = (url?: string) => {
  if (!apolloClient && !url) {
    throw new Error('no cached client and no url to create new client');
  }

  if (!apolloClient && url && url !== cachedUrl) {
    apolloClient = createClient({
      url,
      cacheConfig: cache,
    });
    cachedUrl = url;
  }

  return apolloClient;
};
