const locator = {
  connectToVegaBtn: '[data-testid="connect-to-vega-wallet-btn"]',
  warning: '[data-testid="callout"]',
};

context('Withdraw Page - verify elements on page', function () {
  before('navigate to withdraw page', function () {
    cy.visit('/').navigateTo('withdraw');
  });

  describe('with wallets disconnected', function () {
    it('should have withdraw tab highlighted', function () {
      cy.verifyTabHighlighted('withdraw');
    });

    it('should have WITHDRAW header visible', function () {
      cy.pageHeader().should('be.visible').and('have.text', 'Withdraw');
    });

    it('should have connect Vega wallet button', function () {
      cy.get(locator.connectToVegaBtn)
        .should('be.visible')
        .and('have.text', 'Connect Vega wallet');
    });

    it('should have withdraw information box', function () {
      cy.get(locator.warning).should('be.visible');
    });
  });
});
