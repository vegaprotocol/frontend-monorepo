import { MarketState } from '@vegaprotocol/types';
import { hasOperationName } from '../support';
import { generateMarkets } from '../support/mocks/generate-markets';
import { mockTradingPage } from '../support/trading';

describe('markets table', () => {
  beforeEach(() => {
    cy.mockGQL('Markets', (req) => {
      if (hasOperationName(req, 'Markets')) {
        req.reply({
          body: { data: generateMarkets() },
        });
      }
    });
    cy.visit('/markets');
  });

  it('renders correctly', () => {
    const marketRowHeaderClassname = 'div > span.ag-header-cell-text';
    const marketRowNameColumn = 'tradableInstrument.instrument.code';
    const marketRowSymbolColumn =
      'tradableInstrument.instrument.product.settlementAsset.symbol';
    const marketRowPrices = 'flash-cell';
    const marketRowDescription = 'name';

    cy.wait('@Markets');
    cy.get('.ag-root-wrapper').should('be.visible');

    const expectedMarketHeaders = [
      'Market',
      'Settlement asset',
      'State',
      'Best bid',
      'Best offer',
      'Mark price',
      'Description',
    ];

    for (let index = 0; index < expectedMarketHeaders.length; index++) {
      cy.get(marketRowHeaderClassname).should(
        'contain.text',
        expectedMarketHeaders[index]
      );
    }

    cy.get(`[col-id='${marketRowNameColumn}']`).each(($marketName) => {
      cy.wrap($marketName).should('not.be.empty');
    });

    cy.get(`[col-id='${marketRowSymbolColumn}']`).each(($marketSymbol) => {
      cy.wrap($marketSymbol).should('not.be.empty');
    });

    cy.getByTestId(marketRowPrices).each(($price) => {
      cy.wrap($price).should('not.be.empty').and('contain.text', '.');
    });

    cy.get(`[col-id='${marketRowDescription}']`).each(($marketDescription) => {
      cy.wrap($marketDescription).should('not.be.empty');
    });
  });

  it('can select an active market', () => {
    cy.wait('@Markets');
    cy.get('.ag-root-wrapper').should('be.visible');

    mockTradingPage(MarketState.Active);

    // click on active market
    cy.get('[role="gridcell"][col-id=data]').should('be.visible');
    cy.get('[role="gridcell"][col-id=data]').contains('Active').click();

    cy.wait('@Market');
    cy.contains('ACTIVE MARKET');
    cy.url().should('include', '/markets/market-0');
  });

  it('can select a suspended market', () => {
    cy.wait('@Markets');
    cy.get('.ag-root-wrapper').should('be.visible');

    mockTradingPage(MarketState.Suspended);

    // click on active market
    cy.get('[role="gridcell"][col-id=data]').should('be.visible');
    cy.get('[role="gridcell"][col-id=data]').contains('Suspended').click();

    cy.wait('@Market');
    cy.contains('SUSPENDED MARKET');
    cy.url().should('include', '/markets/market-1');
  });
});
