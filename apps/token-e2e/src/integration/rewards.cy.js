const locator = {
  connectToVegaBtn: '[data-testid="connect-to-vega-wallet-btn"]',
  warning: '[data-testid="callout"]',
};

context('Rewards Page - verify elements on page', function () {
  before('navigate to rewards page', function () {
    cy.visit('/').navigateTo('rewards');
  });

  describe('with wallets disconnected', function () {
    it('should have REWARDS tab highlighted', function () {
      cy.verifyTabHighlighted('rewards');
    });

    it('should have rewards header visible', function () {
      cy.pageHeader().should('be.visible').and('have.text', 'Rewards');
    });

    it('should have epoch warning', function () {
      cy.get(locator.warning)
        .should('be.visible')
        .and(
          'have.text',
          'Rewards are credited 5 minutes after the epoch ends.This delay is set by a network parameter'
        );
    });

    it('should have connect Vega wallet button', function () {
      cy.get(locator.connectToVegaBtn)
        .should('be.visible')
        .and('have.text', 'Connect Vega wallet');
    });
  });
});
