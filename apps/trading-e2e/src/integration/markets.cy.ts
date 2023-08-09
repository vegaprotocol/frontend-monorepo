import * as Schema from '@vegaprotocol/types';
import { aliasGQLQuery } from '@vegaprotocol/cypress';
import { marketsQuery } from '@vegaprotocol/mock';
import { getDateTimeFormat } from '@vegaprotocol/utils';

describe('markets table', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.clearLocalStorage().then(() => {
      cy.mockTradingPage(
        Schema.MarketState.STATE_ACTIVE,
        Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
        Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY_TARGET_NOT_MET
      );
      cy.mockSubscription();
      cy.setOnBoardingViewed();
      cy.visit('/#/markets/all');
    });
  });

  it('opening auction subsets should be properly displayed', () => {
    cy.mockTradingPage(
      Schema.MarketState.STATE_ACTIVE,
      Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION
    );
    cy.mockGQL((req) => {
      const override = {
        marketsConnection: {
          edges: [
            {
              node: {
                tradableInstrument: {
                  instrument: {
                    name: `opening auction MARKET`,
                  },
                },
                state: Schema.MarketState.STATE_ACTIVE,
                tradingMode:
                  Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION,
              },
            },
          ],
        },
      };
      // @ts-ignore partial deep check failing
      const market = marketsQuery(override);
      aliasGQLQuery(req, 'Market', market);
      aliasGQLQuery(req, 'ProposalOfMarket', {
        proposal: { terms: { enactmentDatetime: '2023-01-31 12:00:01' } },
      });
    });
    cy.visit('#/markets/market-0');
    cy.url().should('contain', 'market-0');
    cy.getByTestId('item-value').contains('Opening auction').realHover();
    cy.getByTestId('opening-auction-sub-status').should(
      'contain.text',
      'Opening auction: Not enough liquidity to open'
    );

    const now = new Date(Date.parse('2023-01-30 12:00:01')).getTime();
    cy.clock(now, ['Date']); // Set "now" to BEFORE reservation
    cy.reload();
    cy.getByTestId('item-value').contains('Opening auction').realHover();
    cy.getByTestId('opening-auction-sub-status').should(
      'contain.text',
      `Opening auction: Closing on ${getDateTimeFormat().format(
        new Date('2023-01-31 12:00:01')
      )}`
    );
    cy.clock().then((clock) => {
      clock.restore();
    });
  });
});
