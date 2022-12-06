const connectToVegaBtn = '[data-testid="connect-to-vega-wallet-btn"]';

context(
  'Withdraw Page - verify elements on page',
  { tags: '@smoke' },
  function () {
    before('navigate to withdrawals page', function () {
      cy.visit('/').navigate_to('withdraw');
    });

    describe('with wallets disconnected', function () {
      it('should have withdraw tab highlighted', function () {
        cy.verify_tab_highlighted('withdraw');
      });

      it('should have WITHDRAW header visible', function () {
        cy.verify_page_header('Withdrawals');
      });

      it('should have connect Vega wallet button', function () {
        cy.get(connectToVegaBtn)
          .should('be.visible')
          .and('have.text', 'Connect Vega wallet');
      });
    });
  }
);
