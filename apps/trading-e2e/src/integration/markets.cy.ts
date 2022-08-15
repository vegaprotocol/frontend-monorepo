import { aliasQuery } from '@vegaprotocol/cypress';
import { MarketState } from '@vegaprotocol/types';
import { generateMarketList } from '../support/mocks/generate-market-list';
import { mockTradingPage } from '../support/trading';

describe('markets table', () => {
  beforeEach(() => {
    cy.mockGQL((req) => {
      aliasQuery(req, 'MarketList', generateMarketList());
    });
    cy.visit('/');
    cy.wait('@MarketList');
  });

  it('renders markets correctly', () => {
    cy.get('[data-testid^="market-link-"]')
      .should('not.be.empty')
      .and('have.attr', 'href');
    cy.getByTestId('price').invoke('text').should('not.be.empty');
    cy.getByTestId('settlement-asset').should('not.be.empty');
    cy.getByTestId('price-change-percentage').should('not.be.empty');
    cy.getByTestId('price-change').should('not.be.empty');
    cy.getByTestId('sparkline-svg').should('be.visible');
  });

  it('renders market list drop down', () => {
    openMarketDropDown();
    cy.getByTestId('price').invoke('text').should('not.be.empty');
    cy.getByTestId('trading-mode').should('not.be.empty');
    cy.getByTestId('taker-fee').should('contain.text', '%');
    cy.getByTestId('market-volume').should('not.be.empty');
    cy.getByTestId('market-name').should('not.be.empty');
  });

  it('Able to select market from dropdown', () => {
    cy.mockGQL((req) => {
      mockTradingPage(req, MarketState.Active);
    });

    openMarketDropDown();
    cy.getByTestId('market-link-market-0').click();

    cy.wait('@Market');
    cy.contains('ACTIVE MARKET');
    cy.url().should('include', '/markets/market-0');
    verifyMarketSummaryDisplayed();
  });

  function openMarketDropDown() {
    cy.getByTestId('dialog-close').click();
    cy.getByTestId('popover-trigger').click();
    cy.contains('Loading market data...').should('not.exist');
  }

  function verifyMarketSummaryDisplayed() {
    const marketSummaryBlock = 'market-summary';
    const percentageValue = 'price-change-percentage';
    const priceChangeValue = 'price-change';
    const tradingVolume = 'trading-volume';
    const tradingMode = 'trading-mode';

    cy.getByTestId(marketSummaryBlock).within(() => {
      cy.contains('Change (24h)');
      cy.getByTestId(percentageValue).should('not.be.empty');
      cy.getByTestId(priceChangeValue).should('not.be.empty');
      cy.contains('Volume');
      cy.getByTestId(tradingVolume).should('not.be.empty');
      cy.contains('Trading mode');
      cy.getByTestId(tradingMode).should('not.be.empty');
      cy.getByTestId('mark-price').should('not.be.empty');
    });
  }
});
