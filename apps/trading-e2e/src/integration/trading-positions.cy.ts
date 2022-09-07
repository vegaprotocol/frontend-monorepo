import { MarketState } from '@vegaprotocol/types';
import { mockTradingPage } from '../support/trading';
import { connectVegaWallet } from '../support/vega-wallet';

beforeEach(() => {
  cy.mockGQL((req) => {
    mockTradingPage(req, MarketState.STATE_ACTIVE);
  });
});

describe('positions', () => {
  it('renders positions on trading page', () => {
    cy.visit('/markets/market-0');
    cy.getByTestId('Positions').click();
    cy.getByTestId('tab-positions').contains('Please connect Vega wallet');

    connectVegaWallet();
    validatePositionsDisplayed();
  });

  it('renders positions on portfolio page', () => {
    cy.visit('/portfolio');
    connectVegaWallet();
    validatePositionsDisplayed();
  });

  function validatePositionsDisplayed() {
    cy.getByTestId('tab-positions').should('be.visible');
    cy.getByTestId('tab-positions').within(() => {
      cy.get('[col-id="marketName"]')
        .should('be.visible')
        .each(($marketSymbol) => {
          cy.wrap($marketSymbol).invoke('text').should('not.be.empty');
        });

      cy.get('[col-id="openVolume"]').each(($openVolume) => {
        cy.wrap($openVolume).invoke('text').should('not.be.empty');
      });

      // includes average entry price, mark price, realised PNL & leverage
      cy.getByTestId('flash-cell').each(($prices) => {
        cy.wrap($prices).invoke('text').should('not.be.empty');
      });

      cy.get('[col-id="averageEntryPrice"]')
        .should('contain.text', '11.29935') // entry price
        .should('contain.text', '9.21954'); // liquidation price

      cy.get('[col-id="currentLeverage"]').should('contain.text', '1.1');

      cy.get('[col-id="capitalUtilisation"]') // margin allocated
        .should('contain.text', '0.00%')
        .should('contain.text', '1,000.01000');

      cy.get('[col-id="unrealisedPNL"]').each(($unrealisedPnl) => {
        cy.wrap($unrealisedPnl).invoke('text').should('not.be.empty');
      });

      cy.getByTestId('flash-cell').should('contain.text', '2,785.19482'); // Total tDAI position
      cy.getByTestId('flash-cell').should('contain.text', '0.00100'); // Total Realised PNL
      cy.get('[col-id="unrealisedPNL"]').should('contain.text', '17.90000'); // Total Unrealised PNL
    });

    cy.getByTestId('balance').eq(0).should('have.text', '1,000.01000'); // Asset balance

    cy.getByTestId('close-position').should('be.visible').and('have.length', 3);
  }
});
