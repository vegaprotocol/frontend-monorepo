import {
  connectVegaWallet,
  disconnectVegaWallet,
} from '../support/connect-wallet';
import { aliasQuery } from '@vegaprotocol/cypress';
import { generatePositions } from '../support/mocks/generate-positions';
import { generateAccounts } from '../support/mocks/generate-accounts';

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

    cy.getByTestId('assets').click();
    cy.location('pathname').should('eq', '/portfolio/assets');

    cy.getByTestId('positions').click();
    cy.location('pathname').should('eq', '/portfolio/positions');

    cy.getByTestId('orders').click();
    cy.location('pathname').should('eq', '/portfolio/orders');

    cy.getByTestId('fills').click();
    cy.location('pathname').should('eq', '/portfolio/fills');

    cy.getByTestId('deposits').click();
    cy.location('pathname').should('eq', '/portfolio/deposits');
  });

  describe('Positions view', () => {
    beforeEach(() => {
      cy.mockGQL((req) => {
        aliasQuery(req, 'Positions', generatePositions());
        aliasQuery(req, 'Accounts', generateAccounts());
      });
      cy.visit('/portfolio/positions');
      connectVegaWallet();
    });

    it('data should be properly rendered', () => {
      cy.getByTestId('positions-asset-tDAI').should('exist');
      cy.getByTestId('positions-asset-tEURO').should('exist');
    });
  });
});
