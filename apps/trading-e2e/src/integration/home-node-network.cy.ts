const dialogContent = 'dialog-content';
const nodeHealth = 'node-health';
const nodeHealthTrigger = 'node-health-trigger';

describe('home', { tags: '@regression' }, () => {
  before(() => {
    cy.setOnBoardingViewed();
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.visit('/');
  });

  describe('node health', () => {
    it('shows current block height', () => {
      // 0006-NETW-004
      // 0006-NETW-008
      // 0006-NETW-009
      cy.getByTestId(nodeHealthTrigger).realHover();
      cy.getByTestId(nodeHealth)
        .children()
        .first()
        .should('contain.text', 'Operational', {
          timeout: 10000,
        })
        .should('contain.text', '100'); // all mocked queries have x-block-height header set to 100
      cy.getByTestId(nodeHealth)
        .children()
        .eq(1)
        .should('contain.text', new URL(Cypress.env('VEGA_URL')).hostname);
    });

    it('shows node switcher details', () => {
      // 0006-NETW-012
      // 0006-NETW-013
      // 0006-NETW-014
      // 0006-NETW-015
      // 0006-NETW-016
      cy.getByTestId(nodeHealthTrigger).click();
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
      cy.getByTestId(nodeHealthTrigger).click();
      cy.getByTestId('connect').should('be.disabled');
      cy.getByTestId('node-url-custom').click({ force: true });
      cy.getByTestId('connect').should('be.disabled');
      cy.get("input[placeholder='https://']")
        .focus()
        .type(new URL(Cypress.env('VEGA_URL')).origin + '/graphql');
      cy.getByTestId('connect').click();
    });
  });
});
