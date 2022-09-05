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

      cy.get('[col-id="capitalUtilisation"]') // margin allocated
        .should('contain.text', '0.00%')
        .should('contain.text', '1,000.01000');
    });
  }
});
