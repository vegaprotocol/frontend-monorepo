import { closeWelcomeDialog } from '../support/helpers';

const dialogContent = 'dialog-content';
const nodeHealth = 'node-health';

describe('home', { tags: '@regression' }, () => {
  before(() => {
    cy.clearAllLocalStorage();
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.visit('/');
  });

  describe('footer', () => {
    it.skip('shows current block height', () => {
      closeWelcomeDialog();
      // 0006-NETW-004
      // 0006-NETW-005
      // 0006-NETW-008
      // 0006-NETW-009
      // 0006-NETW-011

      cy.intercept('POST', 'http://localhost:3008/graphql', (req) => {
        req.on('response', (res) => {
          res.setDelay(3001);
        });
      });

      cy.getByTestId(nodeHealth)
        .children()
        .first()
        .should('contain.text', 'Warning delay ( >3 sec)');

      cy.intercept('POST', 'http://localhost:3008/graphql', (req) => {
        req.on('response', (res) => {
          res.setDelay(1);
        });
      });

      cy.getByTestId(nodeHealth)
        .children()
        .first()
        .should('contain.text', 'Operational', { timeout: 10000 })
        .next()
        .should('contain.text', new URL(Cypress.env('VEGA_URL')).origin)
        .next()
        .should('contain.text', '100'); // all mocked queries have x-block-height header set to 100
    });

    it('shows node switcher details', () => {
      // 0006-NETW-012
      // 0006-NETW-013
      // 0006-NETW-014
      // 0006-NETW-015
      // 0006-NETW-016
      closeWelcomeDialog();
      cy.getByTestId(nodeHealth).click();
      cy.getByTestId(dialogContent).should('contain.text', 'Connected node');
      cy.getByTestId(dialogContent).should(
        'contain.text',
        'This app will only work on CUSTOM. Select a node to connect to.'
      );
      cy.getByTestId('node')
        .first()
        .should('contain.text', new URL(Cypress.env('VEGA_URL')).origin)
        .next()
        .should('contain.text', 'Response time')
        .next()
        .should('contain.text', 'Block')
        .next()
        .should('contain.text', 'Subscription');
      cy.getByTestId('custom-row').should('contain.text', 'Other');
      cy.getByTestId('dialog-close').click();
    });

    it('switch to other node', () => {
      // 0006-NETW-017
      // 0006-NETW-018
      // 0006-NETW-019
      // 0006-NETW-020
      cy.getByTestId(nodeHealth).click();
      cy.getByTestId('connect').should('be.disabled');
      cy.getByTestId('node-url-custom').click();
      cy.getByTestId('connect').should('be.disabled');
      cy.get("input[placeholder='https://']")
        .focus()
        .type(new URL(Cypress.env('VEGA_URL')).origin + '/graphql');
      cy.getByTestId('connect').click();
      cy.getByTestId(nodeHealth)
        .children()
        .first()
        .should('contain.text', 'Operational');
    });
  });
  describe('Network switcher', () => {
    before(() => {
      cy.mockTradingPage();
      cy.mockSubscription();
      cy.visit('/');
    });

    // 0006-NETW-002
    // 0006-NETW-003
    it('switch to fairground network', () => {
      cy.getByTestId('network-switcher').click();
      cy.getByTestId('network-item').contains('Fairground testnet').click();
      cy.get('[aria-haspopup="menu"]').should('contain.text', 'Fairground');
    });
  });
});
