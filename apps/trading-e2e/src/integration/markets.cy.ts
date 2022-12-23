import * as Schema from '@vegaprotocol/types';

describe('markets table', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.mockTradingPage(
      Schema.MarketState.STATE_ACTIVE,
      Schema.MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
      Schema.AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY
    );
    cy.mockSubscription();
    cy.visit('/');
    cy.wait('@Market');
    cy.wait('@Markets');
    cy.wait('@MarketsData');
    cy.wait('@MarketsCandles');
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
    cy.get('[data-testid="Active markets"]').should(
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
    cy.getByTestId('external-link')
      .should('have.length', 11)
      .last()
      .should('have.text', 'Propose a new market')
      .and(
        'have.attr',
        'href',
        'https://stagnet3.token.vega.xyz/governance/propose/new-market'
      );
  });
});

function openMarketDropDown() {
  cy.getByTestId('dialog-close').click();
  cy.getByTestId('popover-trigger').click();
  cy.contains('Loading market data...').should('not.exist');
}
