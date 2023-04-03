import { aliasGQLQuery } from '@vegaprotocol/cypress';
import * as Schema from '@vegaprotocol/types';
import type { CyHttpMessages } from 'cypress/types/net-stubbing';
import {
  accountsQuery,
  assetQuery,
  assetsQuery,
  candlesQuery,
  chainIdQuery,
  chartQuery,
  depositsQuery,
  estimateOrderQuery,
  marginsQuery,
  marketCandlesQuery,
  marketDataQuery,
  marketDepthQuery,
  marketInfoQuery,
  marketsCandlesQuery,
  marketsDataQuery,
  marketsQuery,
  networkParamsQuery,
  ordersQuery,
  positionsQuery,
  proposalListQuery,
  statisticsQuery,
  tradesQuery,
  withdrawalsQuery,
} from '@vegaprotocol/mock';
import type { PartialDeep } from 'type-fest';
import type { MarketDataQuery, MarketsQuery } from '@vegaprotocol/market-list';

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
            trigger: data.trigger,
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
  aliasGQLQuery(req, 'ChainId', chainIdQuery());
  aliasGQLQuery(req, 'Statistics', statisticsQuery());
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
  aliasGQLQuery(req, 'Candles', candlesQuery());
  aliasGQLQuery(req, 'Withdrawals', withdrawalsQuery());
  aliasGQLQuery(req, 'NetworkParams', networkParamsQuery());
  aliasGQLQuery(req, 'EstimateOrder', estimateOrderQuery());
  aliasGQLQuery(req, 'ProposalsList', proposalListQuery());
  aliasGQLQuery(req, 'Deposits', depositsQuery());
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      mockTradingPage(
        state?: Schema.MarketState,
        tradingMode?: Schema.MarketTradingMode,
        trigger?: Schema.AuctionTrigger
      ): void;
    }
  }
}
export const addMockTradingPage = () => {
  Cypress.Commands.add(
    'mockTradingPage',
    (state = Schema.MarketState.STATE_ACTIVE, tradingMode, trigger) => {
      cy.mockGQL((req) => {
        mockTradingPage(req, state, tradingMode, trigger);
      });

      // Prevent request to github, return some dummy content
      cy.intercept(
        'GET',
        /^https:\/\/raw.githubusercontent.com\/vegaprotocol\/well-known/,
        {
          body: [
            {
              name: 'Another oracle',
              url: 'https://zombo.com',
              description_markdown:
                'Some markdown describing the oracle provider.\n\nTwitter: @FacesPics2\n',
              oracle: {
                status: 'GOOD',
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
            },
          ],
        }
      );
    }
  );
};
