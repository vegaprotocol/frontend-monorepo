const connectToVegaBtn = '[data-testid="connect-to-vega-wallet-btn"]';
const warning = '[data-testid="callout"]';

context('Withdraw Page - verify elements on page', function () {
  before('navigate to withdraw page', function () {
    cy.visit('/').navigate_to('withdraw');
  });

  describe('with wallets disconnected', function () {
    it('should have withdraw tab highlighted', function () {
      cy.verify_tab_highlighted('withdraw');
    });

    it('should have WITHDRAW header visible', function () {
      cy.verify_page_header('Withdraw');
    });

    it('should have connect Vega wallet button', function () {
      cy.get(connectToVegaBtn)
        .should('be.visible')
        .and('have.text', 'Connect Vega wallet');
    });

    it('should have withdraw information box', function () {
      cy.get(warning).should('be.visible');
    });
  });
});
