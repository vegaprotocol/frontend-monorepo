const connectToVegaBtn = '[data-testid="connect-to-vega-wallet-btn"]';
const warning = '[data-testid="callout"]';

context('Rewards Page - verify elements on page', function () {
  before('navigate to rewards page', function () {
    cy.visit('/').navigate_to('rewards');
  });

  describe('with wallets disconnected', function () {
    it('should have REWARDS tab highlighted', function () {
      cy.verify_tab_highlighted('rewards');
    });

    it('should have rewards header visible', function () {
      cy.verify_page_header('Rewards');
    });

    it('should have epoch warning', function () {
      cy.get(warning)
        .should('be.visible')
        .and(
          'have.text',
          'Rewards are credited 5 minutes after the epoch ends.This delay is set by a network parameter'
        );
    });

    it('should have connect Vega wallet button', function () {
      cy.get(connectToVegaBtn)
        .should('be.visible')
        .and('have.text', 'Connect Vega wallet');
    });
  });
});
