import {
  connectVegaWallet,
  disconnectVegaWallet,
} from '../support/connect-wallet';

describe('Portfolio page', () => {
  afterEach(() => {
    disconnectVegaWallet();
  });

  it('button for wallet connect should work', () => {
    cy.visit('/');
    cy.get('[href="/portfolio"]').eq(0).click();
    cy.getByTestId('trading-connect-wallet').should('be.visible');
    connectVegaWallet();
    cy.getByTestId('trading-connect-wallet').should('not.exist');
  });

  it('certain tabs should exist', () => {
    cy.visit('/portfolio');
    connectVegaWallet();
    cy.getByTestId('Assets').should('exist');
    cy.getByTestId('tab-assets').should('exist');

    cy.getByTestId('Positions').click();
    cy.getByTestId('tab-positions').should('exist');

    cy.getByTestId('Orders').click();
    cy.getByTestId('tab-orders').should('exist');

    cy.getByTestId('Fills').click();
    cy.getByTestId('tab-fills').should('exist');

    cy.getByTestId('Deposits').click();
    cy.getByTestId('tab-deposits').should('exist');
  });
});
