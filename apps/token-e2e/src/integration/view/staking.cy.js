const guideLink = '[data-testid="staking-guide-link"]';
const validators = '[data-testid="validators-grid"]';

context('Staking Page - verify elements on page', function () {
  before('navigate to staking page', function () {
    cy.visit('/').navigate_to('staking');
  });

  describe('with wallets disconnected', function () {
    describe('description section', function () {
      it('should have staking tab highlighted', function () {
        cy.verify_tab_highlighted('staking');
      });

      it('should have STAKING ON VEGA header visible', function () {
        cy.verify_page_header('Staking');
      });

      it('should have Staking Guide link visible', function () {
        cy.get(guideLink)
          .should('be.visible')
          .and('have.text', 'Read more about staking on Vega')
          .and(
            'have.attr',
            'href',
            'https://docs.vega.xyz/docs/mainnet/concepts/vega-chain/#staking-on-vega'
          );
      });
    });
    describe('validators section', function () {
      it('should be visible', function () {
        cy.get(validators).should('be.visible');
      });
    });
  });
});
