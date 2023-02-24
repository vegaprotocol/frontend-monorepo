import * as Schema from '@vegaprotocol/types';
import { aliasGQLQuery } from '@vegaprotocol/cypress';
import { marketsQuery } from '@vegaprotocol/mock';
import { getDateTimeFormat } from '@vegaprotocol/react-helpers';

const dialogCloseBtn = 'dialog-close';
const popoverTrigger = 'popover-trigger';

describe('markets table', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.clearLocalStorage().then(() => {
      cy.mockTradingPage(
        Schema.MarketState.STATE_ACTIVE,
        Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
        Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY
      );
      cy.mockSubscription();
      cy.visit('/');
      cy.wait('@Markets');
      cy.wait('@MarketsData');
      cy.wait('@MarketsCandles');
    });
  });

  it('renders markets correctly', () => {
    cy.get('[data-testid^="market-link-"]').should('not.be.empty');
    cy.getByTestId('price').invoke('text').should('not.be.empty');
    cy.getByTestId('settlement-asset').should('not.be.empty');
    cy.getByTestId('price-change-percentage').should('not.be.empty');
    cy.getByTestId('price-change').should('not.be.empty');
    cy.getByTestId('sparkline-svg').should('be.visible');
  });

  it('renders market list drop down', () => {
    openMarketDropDown();
    cy.getByTestId('price').invoke('text').should('not.be.empty');
    cy.getByTestId('trading-mode-col').should('not.be.empty');
    cy.getByTestId('taker-fee').should('contain.text', '%');
    cy.getByTestId('market-volume').should('not.be.empty');
    cy.getByTestId('market-name').should('not.be.empty');

    cy.getByTestId('trading-mode-col')
      .contains('Monitoring auction - liquidity')
      .eq(0)
      .realHover();
    cy.get('[data-testid="trading-mode-tooltip"] p').should('have.class', '');
    cy.get(
      '[data-testid="market-trading-mode"] [data-testid="item-value"]'
    ).realHover();
    cy.get('[data-testid="trading-mode-tooltip"] p').should(
      'have.class',
      'mb-4'
    );
  });

  it('able to select market from dropdown', () => {
    openMarketDropDown();
    cy.getByTestId('market-link-market-0').first().should('be.visible').click();
    cy.contains('ACTIVE MARKET').should('be.visible');
    cy.url().should('include', '/markets/market-0');
    cy.getByTestId('popover-trigger').should('not.be.empty');
  });

  it('able to open and sort full market list - market page', () => {
    const ExpectedSortedMarkets = [
      'AAPL.MF21',
      'BTCUSD.MF21',
      'ETHBTC.QM21',
      'SOLUSD',
    ];
    cy.getByTestId('view-market-list-link')
      .should('have.attr', 'href', '#/markets/all')
      .click();
    cy.url().should('eq', Cypress.config('baseUrl') + '/#/markets/all');
    cy.contains('AAPL.MF21').should('be.visible');
    cy.get('.ag-header-cell-label').contains('Market').click(); // sort by market name
    for (let i = 0; i < ExpectedSortedMarkets.length; i++) {
      cy.get(`[row-index=${i}]`)
        .find('[col-id="tradableInstrument.instrument.code"]')
        .should('have.text', ExpectedSortedMarkets[i]);
    }
  });

  it('proposed markets tab should be rendered properly', () => {
    cy.getByTestId('view-market-list-link')
      .should('have.attr', 'href', '#/markets/all')
      .click();
    cy.get('[data-testid="All markets"]').should(
      'have.attr',
      'data-state',
      'active'
    );
    cy.get('[data-testid="Proposed markets"]').should(
      'have.attr',
      'data-state',
      'inactive'
    );
    cy.get('[data-testid="Proposed markets"]').click();
    cy.get('[data-testid="Proposed markets"]').should(
      'have.attr',
      'data-state',
      'active'
    );
    cy.getByTestId('tab-proposed-markets').should('be.visible');
    cy.get('.ag-body-viewport .ag-center-cols-container .ag-row').should(
      'have.length',
      10
    );
    cy.getByTestId('tab-proposed-markets')
      .find('[data-testid="external-link"]')
      .should('have.length', 11)
      .last()
      .should('have.text', 'Propose a new market')
      .and(
        'have.attr',
        'href',
        `${Cypress.env('VEGA_TOKEN_URL')}/proposals/propose/new-market`
      );
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
      const market = marketsQuery(override);
      aliasGQLQuery(req, 'Market', market);
      aliasGQLQuery(req, 'ProposalOfMarket', {
        proposal: { terms: { enactmentDatetime: '2023-01-31 12:00:01' } },
      });
    });
    cy.visit('#/markets/market-0');
    cy.url().should('contain', 'market-0');
    cy.getByTestId(dialogCloseBtn).click();
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

function openMarketDropDown() {
  cy.getByTestId(dialogCloseBtn).then((button) => {
    if (button.is(':visible')) {
      cy.get('[data-testid^="market-link-"]').should('not.be.empty');
      cy.getByTestId(dialogCloseBtn).click();
    }
    cy.get('[data-testid^="ask-vol-"]').should('be.visible');
    cy.getByTestId(popoverTrigger).click({ force: true });
    cy.contains('Loading market data...').should('not.exist');
  });
}
