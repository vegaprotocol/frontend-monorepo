import { MarketState } from '@vegaprotocol/types';
import { mockTradingPage } from '../support/trading';
import { connectVegaWallet } from '../support/vega-wallet';

beforeEach(() => {
  cy.mockGQL((req) => {
    mockTradingPage(req, MarketState.STATE_ACTIVE);
  });
  cy.visit('/markets/market-0');
});

describe('positions', () => {
  it('renders positions', () => {
    cy.getByTestId('Positions').click();
    cy.getByTestId('tab-positions').contains('Please connect Vega wallet');

    connectVegaWallet();

    cy.getByTestId('tab-positions').should('be.visible');
    cy.getByTestId('tab-positions')
      .get('[col-id="marketName"]')
      .should('be.visible')
      .each(($marketSymbol) => {
        cy.wrap($marketSymbol).invoke('text').should('not.be.empty');
      });
    cy.getByTestId('tab-positions')
      .get('[col-id="openVolume"]')
      .each(($openVolume) => {
        cy.wrap($openVolume).invoke('text').should('not.be.empty');
      });
    // includes average entry price, mark price & realised PNL
    cy.getByTestId('tab-positions')
      .getByTestId('flash-cell')
      .each(($prices) => {
        cy.wrap($prices).invoke('text').should('not.be.empty');
      });
  });
});
