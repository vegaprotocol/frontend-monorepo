const connectPrompt = '[data-testid="eth-connect-prompt"]';
const connectButton = '[data-testid="connect-to-eth-btn"]';

context('Vesting Page - verify elements on page', function () {
  before('navigate to vesting page', function () {
    cy.visit('/').navigate_to('vesting');
  });

  describe('with wallets disconnected', function () {
    it('should have vesting tab highlighted', function () {
      cy.verify_tab_highlighted('vesting');
    });

    it('should have VESTING header visible', function () {
      cy.verify_page_header('Vesting');
    });

    it('should have connect Eth wallet info', function () {
      cy.get(connectPrompt).should('be.visible');
    });

    it('should have connect Eth wallet button', function () {
      cy.get(connectButton)
        .should('be.visible')
        .and('have.text', 'Connect Ethereum wallet');
    });
  });
});
