import { aliasQuery } from '@vegaprotocol/cypress';
import type { MarketList, MarketList_markets } from '@vegaprotocol/market-list';
import { MarketState } from '@vegaprotocol/types';
import { generateMarketList } from '../support/mocks/generate-market-list';
import { generateMarkets } from '../support/mocks/generate-markets';
import type { MarketsLanding } from '../support/mocks/generate-markets-landing';
import { generateMarketsLanding } from '../support/mocks/generate-markets-landing';
import { mockTradingPage } from '../support/trading';

describe('home', () => {
  const selectMarketOverlay = 'select-market-list';

  describe('default market found', () => {
    let marketsLanding: MarketsLanding;
    let marketList: MarketList;
    let oldestMarket: MarketList_markets;

    beforeEach(() => {
      marketsLanding = generateMarketsLanding();
      marketList = generateMarketList();
      oldestMarket = getOldestOpenMarket(
        marketList.markets as MarketList_markets[]
      );

      // Mock markets query that is triggered by home page to find default market
      cy.mockGQL((req) => {
        aliasQuery(req, 'MarketsLanding', marketsLanding);
        aliasQuery(req, 'MarketList', marketList);

        // Mock all market page queries
        mockTradingPage(req, MarketState.Active);
      });

      cy.visit('/');
      cy.wait('@GQL');

      cy.contains('Loading...').should('be.visible');
      cy.contains('Loading...').should('not.exist');
      cy.get('main[data-testid="market"]').should('exist'); // Wait for page to be rendered to before checking url

      cy.url().should('include', `/markets/${oldestMarket.id}`); // Should redirect to oldest market
    });

    it('redirects to a default market with the landing dialog open', () => {
      // Overlay should be shown
      cy.getByTestId(selectMarketOverlay).should('exist');
      cy.contains('Select a market to get started').should('be.visible');

      // I expect the market overlay table to contain at least 3 rows (one header row)
      cy.getByTestId(selectMarketOverlay)
        .get('table tr')
        .then((row) => {
          expect(row.length).to.eq(3);
        });

      // each market shown in overlay table contains content under the last price and change fields
      cy.getByTestId(selectMarketOverlay)
        .get('table tr')
        .each(($element, index) => {
          if (index > 0) {
            // skip header row
            cy.root().within(() => {
              cy.getByTestId('price').should('not.be.empty');
            });
          }
        });

      // the oldest market trading in continous mode shown at top of overlay table
      cy.get('table tr')
        .eq(1)
        .within(() =>
          cy
            .contains(oldestMarket.tradableInstrument.instrument.code)
            .should('be.visible')
        );

      cy.getByTestId('dialog-close').click();
      cy.getByTestId(selectMarketOverlay).should('not.exist');

      // the choose market overlay is no longer showing
      cy.contains('Select a market to get started').should('not.exist');
      cy.contains('Loading...').should('not.exist');
    });

    it('can click a market name to load that market', () => {
      // Click newer market
      cy.getByTestId(selectMarketOverlay)
        .should('exist')
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .contains(marketList.markets![1].tradableInstrument.instrument.code)
        .click();
      cy.getByTestId(selectMarketOverlay).should('not.exist');
      cy.url().should('include', 'market-1');
    });

    it('view full market list goes to markets page', () => {
      cy.getByTestId(selectMarketOverlay)
        .should('exist')
        .contains('Or view full market list')
        .click();
      cy.getByTestId(selectMarketOverlay).should('not.exist');
      cy.url().should('include', '/markets');
      cy.get('main[data-testid="markets"]').should('exist');
    });
  });

  describe('no default found', () => {
    it('redirects to a the market list page if no sensible default is found', () => {
      // Mock markets query that is triggered by home page to find default market
      cy.mockGQL((req) => {
        aliasQuery(
          req,
          'MarketsLanding',
          generateMarketsLanding({
            markets: [
              {
                marketTimestamps: {
                  __typename: 'MarketTimestamps',
                  open: '',
                },
              },
              {
                marketTimestamps: {
                  __typename: 'MarketTimestamps',
                  open: '',
                },
              },
            ],
          })
        );
        aliasQuery(req, 'Markets', generateMarkets());

        // Mock all market page queries
        mockTradingPage(req, MarketState.Active);
      });

      cy.visit('/');
      cy.wait('@MarketsLanding');
      cy.url().should('include', '/markets');
    });
  });
});

function getOldestOpenMarket(openMarkets: MarketList_markets[]) {
  const [oldestMarket] = openMarkets.sort(
    (a, b) =>
      new Date(a.marketTimestamps.open as string).getTime() -
      new Date(b.marketTimestamps.open as string).getTime()
  );
  if (!oldestMarket) {
    throw new Error('Could not find oldest market');
  }
  return oldestMarket;
}
