import {
  AuctionTrigger,
  MarketState,
  MarketTradingMode,
} from '@vegaprotocol/types';

describe('markets table', { tags: '@smoke' }, () => {
  beforeEach(() => {
    cy.mockTradingPage(
      MarketState.STATE_ACTIVE,
      MarketTradingMode.TRADING_MODE_MONITORING_AUCTION,
      AuctionTrigger.AUCTION_TRIGGER_LIQUIDITY
    );
    cy.mockGQLSubscription();
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
    cy.getByTestId('link').should('have.attr', 'href', '/markets').click();
    cy.url().should('eq', Cypress.config('baseUrl') + '/markets');
    cy.contains('AAPL.MF21').should('be.visible');
    cy.contains('Market').click(); // sort by market name
    for (let i = 0; i < ExpectedSortedMarkets.length; i++) {
      cy.get(`[row-index=${i}]`)
        .find('[col-id="tradableInstrument.instrument.code"]')
        .should('have.text', ExpectedSortedMarkets[i]);
    }
  });
});

function openMarketDropDown() {
  cy.getByTestId('dialog-close').click();
  cy.getByTestId('popover-trigger').click();
  cy.contains('Loading market data...').should('not.exist');
}
