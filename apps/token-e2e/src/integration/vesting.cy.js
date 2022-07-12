const locator = {
  connectPrompt: '[data-testid="eth-connect-prompt"]',
  connectButton: '[data-testid="connect-to-eth-btn"]',
};

context('Vesting Page - verify elements on page', function () {
  before('navigate to vesting page', function () {
    cy.visit('/').navigateTo('vesting');
  });

  describe('with wallets disconnected', function () {
    it('should have vesting tab highlighted', function () {
      cy.verifyTabHighlighted('vesting');
    });

    it('should have VESTING header visible', function () {
      cy.pageHeader().should('be.visible').and('have.text', 'Vesting');
    });

    it('should have connect Eth wallet info', function () {
      cy.get(locator.connectPrompt).should('be.visible');
    });

    it('should have connect Eth wallet button', function () {
      cy.get(locator.connectButton)
        .should('be.visible')
        .and('have.text', 'Connect Ethereum wallet');
    });
  });
});
