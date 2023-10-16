import { aliasGQLQuery } from '@vegaprotocol/cypress';
import * as Schema from '@vegaprotocol/types';
import type { CyHttpMessages } from 'cypress/types/net-stubbing';
import type { Provider, Status } from '@vegaprotocol/markets';
import {
  accountsQuery,
  assetQuery,
  assetsQuery,
  candlesQuery,
  chartQuery,
  depositsQuery,
  estimateFeesQuery,
  marginsQuery,
  marketCandlesQuery,
  marketDataQuery,
  marketDepthQuery,
  marketInfoQuery,
  marketsCandlesQuery,
  marketsDataQuery,
  marketsQuery,
  networkParamsQuery,
  nodeGuardQuery,
  ordersQuery,
  estimatePositionQuery,
  positionsQuery,
  proposalListQuery,
  tradesQuery,
  withdrawalsQuery,
  protocolUpgradeProposalsQuery,
  blockStatisticsQuery,
  networkParamQuery,
  liquidityProvisionsQuery,
  successorMarketQuery,
  parentMarketIdQuery,
  successorMarketIdsQuery,
  successorMarketProposalDetailsQuery,
} from '@vegaprotocol/mock';
import type { PartialDeep } from 'type-fest';
import type { MarketDataQuery, MarketsQuery } from '@vegaprotocol/markets';

type MarketPageMockData = {
  state: Schema.MarketState;
  tradingMode?: Schema.MarketTradingMode;
  trigger?: Schema.AuctionTrigger;
};

const ORACLE_PUBKEY = Cypress.env('ORACLE_PUBKEY');

const marketDataOverride = (
  data: MarketPageMockData
): PartialDeep<MarketDataQuery> => ({
  marketsConnection: {
    edges: [
      {
        node: {
          data: {
            // @ts-ignore conflict between incoming and outgoing types
            trigger: data.trigger,
            // @ts-ignore same as above
            marketTradingMode: data.tradingMode,
            marketState: data.state,
          },
        },
      },
    ],
  },
});

const marketsDataOverride = (
  data: MarketPageMockData
): PartialDeep<MarketsQuery> => ({
  marketsConnection: {
    edges: [
      {
        node: {
          // @ts-ignore conflict between incoming and outgoing types
          tradingMode: data.tradingMode,
          state: data.state,
        },
      },
    ],
  },
});

const mockTradingPage = (
  req: CyHttpMessages.IncomingHttpRequest,
  state: Schema.MarketState = Schema.MarketState.STATE_ACTIVE,
  tradingMode?: Schema.MarketTradingMode,
  trigger?: Schema.AuctionTrigger
) => {
  aliasGQLQuery(req, 'NodeGuard', nodeGuardQuery());
  aliasGQLQuery(
    req,
    'Markets',
    marketsQuery(marketsDataOverride({ state, tradingMode, trigger }))
  );
  aliasGQLQuery(
    req,
    'MarketData',
    marketDataQuery(marketDataOverride({ state, tradingMode, trigger }))
  );
  aliasGQLQuery(req, 'MarketsData', marketsDataQuery());
  aliasGQLQuery(req, 'MarketsCandles', marketsCandlesQuery());
  aliasGQLQuery(req, 'MarketCandles', marketCandlesQuery());
  aliasGQLQuery(req, 'MarketDepth', marketDepthQuery());
  aliasGQLQuery(req, 'Orders', ordersQuery());
  aliasGQLQuery(req, 'Accounts', accountsQuery());
  aliasGQLQuery(req, 'Positions', positionsQuery());
  aliasGQLQuery(req, 'Margins', marginsQuery());
  aliasGQLQuery(req, 'Assets', assetsQuery());
  aliasGQLQuery(req, 'Asset', assetQuery());
  aliasGQLQuery(
    req,
    'MarketInfo',
    marketInfoQuery({
      market: {
        tradableInstrument: {
          instrument: {
            product: {
              __typename: 'Future',
              dataSourceSpecForSettlementData: {
                data: {
                  sourceType: {
                    sourceType: {
                      signers: [
                        {
                          __typename: 'Signer',
                          signer: {
                            __typename: 'PubKey',
                            key: ORACLE_PUBKEY,
                          },
                        },
                      ],
                    },
                  },
                },
              },
              dataSourceSpecForTradingTermination: {
                data: {
                  sourceType: {
                    sourceType: {
                      signers: [
                        {
                          __typename: 'Signer',
                          signer: {
                            __typename: 'PubKey',
                            key: ORACLE_PUBKEY,
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    })
  );
  aliasGQLQuery(req, 'Trades', tradesQuery());
  aliasGQLQuery(req, 'Chart', chartQuery());
  aliasGQLQuery(req, 'LiquidityProvisions', liquidityProvisionsQuery());
  aliasGQLQuery(req, 'LiquidityProviderFeeShare');
  aliasGQLQuery(req, 'Candles', candlesQuery());
  aliasGQLQuery(req, 'Withdrawals', withdrawalsQuery());
  aliasGQLQuery(req, 'NetworkParams', networkParamsQuery());
  aliasGQLQuery(req, 'NetworkParam', networkParamQuery);
  aliasGQLQuery(req, 'EstimateFees', estimateFeesQuery());
  aliasGQLQuery(req, 'EstimatePosition', estimatePositionQuery());
  aliasGQLQuery(req, 'ProposalsList', proposalListQuery());
  aliasGQLQuery(req, 'Deposits', depositsQuery());
  aliasGQLQuery(
    req,
    'ProtocolUpgradeProposals',
    protocolUpgradeProposalsQuery()
  );
  aliasGQLQuery(req, 'BlockStatistics', blockStatisticsQuery());
  aliasGQLQuery(req, 'SuccessorMarket', successorMarketQuery());
  aliasGQLQuery(req, 'ParentMarketId', parentMarketIdQuery());
  aliasGQLQuery(req, 'SuccessorMarketIds', successorMarketIdsQuery());
  aliasGQLQuery(
    req,
    'SuccessorMarketProposalDetails',
    successorMarketProposalDetailsQuery()
  );
};
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      mockTradingPage(
        state?: Schema.MarketState,
        tradingMode?: Schema.MarketTradingMode,
        trigger?: Schema.AuctionTrigger,
        oracleStatus?: Status
      ): void;
    }
  }
}

export const addMockTradingPage = () => {
  Cypress.Commands.add(
    'mockTradingPage',
    (
      state = Schema.MarketState.STATE_ACTIVE,
      tradingMode,
      trigger,
      oracleStatus
    ) => {
      cy.mockChainId();
      cy.mockGQL((req) => {
        mockTradingPage(req, state, tradingMode, trigger);
      });

      const oracle: Provider = {
        name: 'Another oracle',
        url: 'https://zombo.com',
        description_markdown:
          'Some markdown describing the oracle provider.\n\nTwitter: @FacesPics2\n',
        oracle: {
          status: oracleStatus || 'GOOD',
          status_reason: '',
          first_verified: '2022-01-01T00:00:00.000Z',
          last_verified: '2022-12-31T00:00:00.000Z',
          type: 'public_key',
          public_key: ORACLE_PUBKEY,
        },
        proofs: [
          {
            format: 'signed_message',
            available: true,
            type: 'public_key',
            public_key: ORACLE_PUBKEY,
            message: 'SOMEHEX',
          },
        ],
        github_link: `https://github.com/vegaprotocol/well-known/blob/main/oracle-providers/public_key-${ORACLE_PUBKEY}.toml`,
      };
      // Prevent request to github, return some dummy content
      cy.intercept(
        'GET',
        /^https:\/\/raw.githubusercontent.com\/vegaprotocol\/well-known/,
        {
          body: [oracle],
        }
      );
    }
  );
};
