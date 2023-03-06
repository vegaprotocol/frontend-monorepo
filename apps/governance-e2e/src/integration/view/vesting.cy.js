const connectButton = '[data-testid="connect-to-eth-btn"]';

context(
  'Vesting Page - verify elements on page',
  { tags: '@smoke' },
  function () {
    describe('with wallets disconnected', function () {
      before('navigate to vesting page', function () {
        cy.visit('/').navigate_to('vesting');
      });
      it('should have vesting tab highlighted', function () {
        cy.verify_tab_highlighted('token');
      });

      it('should have VESTING header visible', function () {
        cy.verify_page_header('Vesting');
      });

      it('should have connect Eth wallet button', function () {
        cy.get(connectButton)
          .should('be.visible')
          .and('have.text', 'Connect Ethereum wallet');
      });
    });
  }
);
